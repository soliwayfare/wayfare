---
title: "Introduction of an easy to use data visualization library - MetricsGraphic"
date: "2018-08-26 16:37:50"
permalink: "post/Introduction-of-a-very-easy-to-use-data-visualization-library-metricsgraphic/"
tags:
  - "分享"
---

I participated in the Google Summer of Code 2018 that ended in days before with Mozilla [Metrics Graphics](https://github.com/metricsgraphics/metrics-graphics). The Metrics Graphic is an easy to use data visualization library based on D3.js. It just has only one main method to create the chart but contains many types of graph and options.

<!-- more -->

If you do not have a high requirement for the customized style of chart and want a beautiful chart to show your data, Metrics Graphics is a good choice to use. You can learn the usage of it from [the examples page](https://metricsgraphicsjs.org/examples.htm). And you can find all available options of Metrics Graphics from [the wiki page](https://github.com/metricsgraphics/metrics-graphics/wiki/List-of-Options). But there is a bit missing because of lacking timely update. We are planning use self-hosted document page that be generated from a list automatically. And then it will be kept consistent with the code.

### What I did

Following is what I did for Metrics Graphics. In my proposal, I plan to add brushing and zooming support for charts. And add highlighting point feature for the scatterplot. The zooming is a very useful feature for a graph library and in many cases need to use it. Metrics Graphics provide this feature by an addon before. But it is not very convenient and controllable, so we hope Metrics Graphics can contain this feature.

The final effect of it like this. You can have a try in the example page of brushing and zooming.

![](/blog/images/Introduction-of-a-very-easy-to-use-data-visualization-library-metricsgraphic/5b8a31450e1a5.gif)

It has some differences with the addon. We can use it on both the type of chart of line and point but the addon support line chart only. Besides, we can brush not only horizontal but also vertical (of cause you can restrict brush on one of horizontal or vertical only). And I add a zoom_target option, it could be used to create an overview plot easily. You can create another chart but set the zoom_target as this chart. After that, you can get the following effect.

![](/blog/images/Introduction-of-a-very-easy-to-use-data-visualization-library-metricsgraphic/5b8a31452951d.gif)

It is the general flow chart of the implementation of brushing and zooming. The `mg_add_brush_function` will add the mouse events handler of the chart if you set the `brush` options. And the event handler will process the works of calculating the selected data range, zooming target chart and creating a brushing pattern on the plot.

![](/blog/images/Introduction-of-a-very-easy-to-use-data-visualization-library-metricsgraphic/5b8a3b31836be.png)

After that, a callback function named `brushing_selection_changed` that set by the user will be called and the user could do some custom operations.

### Some other work

Except these, I also made some examples of my works about brushing and zooming and creating a tooltip with popper.js. In order to make it is easy to create a Vue or React component, I spent some time to organize a list of options and it could be accessed programmatically and it could be used to check the type of the options user given. This may also be used to generate documentation in the future. There is still much work to be done for making Metrics Graphics better in the future.
