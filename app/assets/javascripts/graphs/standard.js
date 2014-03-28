var graph=[]
var data;


function renderStandard(index) { 

	update = metricURL(gon.metrics[index].feed, gon.start, gon.stop, gon.step)
                
	$.getJSON(update, function(data) {
		if (data.error) { 
			renderError("chart_"+index, "error retreiving data from endpoint", data.error); stopAll(); return false
		} 
		if (data.length == 0) { 
			renderError("chart_"+index, "no data returned from endpoint", metricURL(gon.metrics[index].feed, gon.start, gon.stop, gon.step)); stopAll(); return false
		}
		graph[index] = new Rickshaw.Graph({
			element: document.getElementById("chart_"+index),
			width: 700,
			height: 200,
			min: 'auto',
			renderer: 'line',
			series: [{data: data, color: color[index]}   ]
		})

		if (gon.metrics[index].metric.indexOf("uom:c") != -1 ) 	{ 
			graph[index].configure({interpolation: 'step'})
		}

		chart = "chart_"+index
		yaxis = "y_axis_"+index

		new Rickshaw.Graph.Axis.Y( {
			graph: graph[index],
			orientation: 'left',
		   	pixelsPerTick: 30,
			tickFormat: Rickshaw.Fixtures.Number.formatBase1024KMGTP_round,
			element: document.getElementById(yaxis)
		} );

		new Rickshaw.Graph.Axis.Time({
			graph: graph[index],
			timeFixture: new Rickshaw.Fixtures.Time.Precise.Local()
		});

		dynamicWidth(graph[index]);
		graph[index].render()
		
		new Rickshaw.Graph.HoverDetail({
			graph: graph[index],
			formatter: function (series, x, y) {
				return content = "<span class='date'>"+d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(x*1000)) +"</span><br/>"+y
			}
		});

		graph[index].render()

		unrenderWaiting("chart_"+index);
		renderSlider();
	}) 
}

function updateStandard(){ 
	id = setInterval(function() { 		
		now = parseInt(Date.now()/1000)
		span = (gon.stop - gon.start)

		$.each(gon.metrics, function(i, metric) { 
			if (metric.live) { 

			update = metricURL(metric.feed,now-span,now,gon.step)
			$.getJSON(update, function(d){ 
				if (d.error) { 
					renderError("flash", "error retrieving data from endpoint", d.error); stopAll(); return false
				} 
				if (d.length == 0) { 
					renderError("flash", "no data returned from endpoint", update); stopAll(); return false
				}
				graph[i].series[0].data = d
				graph[i].render()
			})
			}
		})
	}
	, gon.step*1000);
	return id
}


function clean (arr, deleteValue) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == deleteValue) {         
      arr.splice(i, 1);
      i--;
    }
  }
  return arr;
};


var complete = 0;
var slider; 
function renderSlider() { 
        complete++;

        // Render the multiple graph slider only when all the graphing operations have been completed.
        if (complete == gon.metrics.length) { 
	slider = new Rickshaw.Graph.RangeSlider.Preview({ 
                graphs: clean(graph, undefined), 
                height: 50,
		element: document.getElementById("multi_slider")//$("#multi_slider")
                });
        }
	fitSlider(); 
}
