/**
 * @ngdoc function
 * @name Google Organization Chart
 * @author Yianni Ververis
 * @email yianni.ververis@qlik.com
 * @description
 * Google Organization Chart as found
 * https://developers.google.com/chart/interactive/docs/gallery/orgchart
 */

define( [ 
	"qlik",
	"https://www.gstatic.com/charts/loader.js"
],
function ( qlik) {
		"use strict";
		return {
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 7,
						qHeight: 900
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 2, // One Dimension for the Employee and the other one for its manager, 3 Tooltip
						max: 5
					},
					measures: {
						uses: "measures",
						min: 0, // For each line
						max: 0
					},
					sorting: {
						uses: "sorting"
					},
					settings : {
						uses : "settings",
						items: {
							Chart: {
								type: "items",
								label: "Organization Chart Settings",
								items: {
									bgColor: {
										type: "string",
										expression: "none",
										label: "Background Color",
										defaultValue: "#e5e5e5",
										ref: "vars.color.bg"
									},
									// nameColor: {
									// 	type: "string",
									// 	expression: "none",
									// 	label: "name Color",
									// 	defaultValue: "#000000",
									// 	ref: "vars.color.name"
									// },
								}
							}
						}
					}
				}
			},
			support: {
				snapshot: true,
				export: true,
				exportData: true
			},
			paint: function ($element,layout) {
				var vars = $.extend(true,{
					v: '1.1.0',
					id: layout.qInfo.qId,
					innerid: layout.qInfo.qId + '_inner',
					field: layout.qHyperCube.qDimensionInfo[0].qFallbackTitle,
					data: layout.qHyperCube.qDataPages[0].qMatrix,
					totalColumns: layout.qHyperCube.qSize.qcx,
					totalRows: layout.qHyperCube.qSize.qcy,
					height: $element.height(),
					width: $element.width(),
					headers: ['Name','Manager','ToolTip'],
					this: this,
					chart: null,
					options: {
						allowHtml: true,
					},
				}, layout.vars);
				vars.css = '\n\
					#' + vars.id + ' { \n\
						width: ' + vars.width + 'px; \n\
						height: ' + vars.height + 'px; \n\
						overflow-x: auto !important; \n\
						overflow-y: hidden !important; \n\
					} \n\
					#' + vars.innerid + ' { \n\
						width: ${vars.contentWidth}px; \n\
					} \n\
					.google-visualization-orgchart-node { \n\
						border: 0 !important; \n\
						-moz-border-radius: 0 !important; \n\
						-webkit-border-radius: 0 !important; \n\
						-webkit-box-shadow: none !important; \n\
						-moz-box-shadow: none !important; \n\
						background-color: ' + vars.color.bg + ' !important; \n\
						background: ' + vars.color.bg + ' !important; \n\
					} \n\
				';
				$("<style>").html(vars.css).appendTo("head");

				// Create the holder with the unique id
				vars.template = '\
					<div id="' + vars.id + '">\
						<div id="' + vars.id + '_inner">\
						</div>\n\
					</div>\n\
				';
				$element.html(vars.template);

				// Start Creating the Google Annotation Chart
				if (typeof google.visualization === 'undefined') {
					google.charts.load('current', {packages:["orgchart"]});
				}

				var table = [vars.headers];
				for (var i=0; i<vars.totalRows; i++) {
					// For Level 1 and 2
					let row = [
						{v:vars.data[i][0].qText, f:vars.data[i][0].qText+'<div style="color:red; font-style:italic">'+layout.qHyperCube.qDimensionInfo[0].qFallbackTitle+'</div>'},
						vars.data[i][1].qText, 
						layout.qHyperCube.qDimensionInfo[0].qFallbackTitle						
					]
					table.push(row);
					// for level 3
					if (vars.totalColumns>=3) {
						row = [
							{v:vars.data[i][1].qText, f:vars.data[i][1].qText+'<div style="color:red; font-style:italic">'+layout.qHyperCube.qDimensionInfo[1].qFallbackTitle+'</div>'},
							vars.data[i][2].qText, 
							layout.qHyperCube.qDimensionInfo[1].qFallbackTitle					
						]
						table.push(row);
					}
					// for level 4
					if (vars.totalColumns>=4) {
						row = [
							{v:vars.data[i][2].qText, f:vars.data[i][2].qText+'<div style="color:red; font-style:italic">'+layout.qHyperCube.qDimensionInfo[2].qFallbackTitle+'</div>'},
							vars.data[i][3].qText, 
							layout.qHyperCube.qDimensionInfo[2].qFallbackTitle					
						]
						table.push(row);
					}
					// for level 5
					if (vars.totalColumns>=5) {
						row = [
							{v:vars.data[i][3].qText, f:vars.data[i][3].qText+'<div style="color:red; font-style:italic">'+layout.qHyperCube.qDimensionInfo[3].qFallbackTitle+'</div>'},
							vars.data[i][4].qText, 
							layout.qHyperCube.qDimensionInfo[3].qFallbackTitle					
						]
						table.push(row);
					}
				}

				google.charts.setOnLoadCallback(drawChart);

				function drawChart() {
			        var data2 = google.visualization.arrayToDataTable(table, false); // 'false' means that the first row contains labels, not data.
					vars.chart = new google.visualization.OrgChart(document.getElementById(vars.innerid));
					vars.chart.draw(data2, vars.options);  
					// google.visualization.events.addListener(vars.chart, 'select', selectHandler);               
				}
				// function selectHandler(e) {
				// 	console.log(e)
				// }

				console.info('%c Google Organization Chart ' + vars.v + ': ', 'color: red', '#' + vars.id + ' Loaded!');

			},
		}
} );

