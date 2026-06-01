---
title: "Publish browser extension automatically"
date: "2018-09-08 16:42:30"
permalink: "post/Publish-browser-extension-automatically/"
tags:
  - "教程"
---

It is my first try to using CircleCI. Instead of using TravisCI because I hope it can execute some tasks in parallel and execute some tasks after a task success but the TravisCI cannot achieve it.

The following workflow is the final result.

![2018-09-18-221433_1038x239_scrot.png](/blog/images/Publish-browser-extension-automatically/5ba108601024e.png)

<!-- more -->

We need two command line tool: [chrome-webstore-upload-cli](https://www.npmjs.com/package/chrome-webstore-upload-cli) and [web-ext](https://www.npmjs.com/package/web-ext/v/1.9.1-with-submit.1).

The chrome-webstore-upload-cli could help you publish the extension to the google chrome extension store. It is based on [chrome-webstore-upload](https://github.com/DrewML/chrome-webstore-upload) which is a tool like [chrome-webstore-manager](https://github.com/pastak/chrome-webstore-manager). Its author made an easy to use cli tool to make user could publish their extension without any extra code. And you just need to set some environment varible (CLIENT_ID, CLIENT_SECRET and REFRESH_TOKEN). The author of this tool also made a [tutorial](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md) humanly to tell you how to generate Google API keys.

For publishing to firefox addons you can use web-ext. Actually it is a fork of web-ext. You can learn it from the author of it left [the comment](https://github.com/mozilla/web-ext/issues/804#issuecomment-302588357) under a issue of web-ext. It is available indeed. You just need to generate an API key from [here](https://addons.mozilla.org/en-US/developers/addon/api/key/). Except it you also need give the id of your extension, otherwise it will become a new item in the firefox addons.

It is the UUID in the following image. You can find it in detail of the addon page.

![2018-09-18-224901_690x408_scrot.png](/blog/images/Publish-browser-extension-automatically/5ba1106def1b8.png)


After you got all of above things, you can put following code to your CircleCI config file.

```yaml
jobs:
  # ... here omit the build and others job
  publish_chrome:
    docker:
      - image: circleci/node:8.11.3-jessie
    working_directory: ~/ext
    steps:
      - restore_cache:
          key: build-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: publish
          command: |
            yarn global add chrome-webstore-upload-cli
            export PATH="$PATH:$HOME/.config/yarn/global/node_modules/.bin"
            webstore upload --source dist.zip --extension-id $EXTENSION_ID --auto-publish

  publish_firefox:
    docker:
      - image: circleci/node:8.11.3-jessie
    working_directory: ~/ext
    steps:
      - restore_cache:
          key: build-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: publish
          command: |
            yarn global add webext@1.9.1-with-submit.1
            export PATH="$PATH:$HOME/.config/yarn/global/node_modules/.bin"
            webext submit --api-key=${FF_API_KEY} --api-secret=${FF_API_SECRET} --id=${FF_ID} -s dist
```

At last, put the job to the workflow and set the requirement of them as `build` job are all things you need to do. If you hope the publish job only executed when the commit with a tag you can configure it like following code.

```yaml
workflows:
  version: 2
  main:
    jobs:
      - install_dependencies:
          filters:
            tags:
              only: /^v.*/
      - build:
          requires:
            - install_dependencies
          filters:
            tags:
              only: /^v.*/
      - publish_chrome:
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - publish_firefox:
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - release:
          requires:
            - publish_chrome
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

I hope to download a .crx file from chrome extension store and upload it to release page to help someone cannot visit google service get it so I add a job `release` requires `publish_chrome`. It use [ghr](https://github.com/tcnksm/ghr) to manage github release page.

The whole config file is [here](https://github.com/cnwangjie/better-onetab/blob/master/.circleci/config.yml).
