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
						max: 3
					},
					// measures: {
					// 	uses: "measures",
					// 	min: 1, // For each line
					// 	max: 4
					// },
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
									// connectorColor: {
									// 	type: "string",
									// 	expression: "none",
									// 	label: "Connector Color (HEX value separated by comma)",
									// 	defaultValue: "#cc3c3c",
									// 	ref: "vars.connector.color"
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
				var vars = {
					v: '1.0.1',
					id: layout.qInfo.qId,
					field: layout.qHyperCube.qDimensionInfo[0].qFallbackTitle,
					data: layout.qHyperCube.qDataPages[0].qMatrix,
					height: $element.height(),
					width: $element.width(),
					this: this,
					chart: null,
					options: {
						allowHtml: true,
					},
					// connector: {
					// 	color: (layout.vars.connector.color) ? layout.vars.connector.color : '#cc3c3c',
					// }
				}
				vars.headers = [
					layout.qHyperCube.qDimensionInfo[0].qFallbackTitle,
					layout.qHyperCube.qDimensionInfo[1].qFallbackTitle,
				];
				if (typeof layout.qHyperCube.qDimensionInfo[2] !== "undefined") {
					vars.headers.push(layout.qHyperCube.qDimensionInfo[2].qFallbackTitle)
				}

				vars.css = '\n\
					#' + vars.id + ' {\n\
						height: ' + vars.height + 'px; \n\
						width: ' + vars.width + 'px; \n\
					}\n\
				';
				$("<style>").html(vars.css).appendTo("head");

				// Create the holder with the unique id
				vars.template = '\
					<div qv-extension class="google-organization-chart" id="' + vars.id + '">\
					</div>\n\
				';
				$element.html(vars.template);

				// Start Creating the Google Annotation Chart
				if (typeof google.visualization === 'undefined') {
					google.charts.load('current', {packages:["orgchart"]});
				}
				var table = [vars.headers];
				for (var i=0; i<vars.data.length; i++) {
					var row = [
						vars.data[i][0].qText, 
						(vars.data[i][1].qText!=='-') ? vars.data[i][1].qText : null, 
						(vars.data[i][2].qText!=='-') ? vars.data[i][2].qText : null, 
					]
					table.push(row);
				}

				google.charts.setOnLoadCallback(drawChart);

				function drawChart() {
			        var data2 = google.visualization.arrayToDataTable(table, false); // 'false' means that the first row contains labels, not data.
					vars.chart = new google.visualization.OrgChart(document.getElementById(vars.id));
					vars.chart.draw(data2, vars.options);                   
				}

				console.info('%c Google Organization Chart ' + vars.v + ': ', 'color: red', '#' + vars.id + ' Loaded!');

			},
		}
} );

