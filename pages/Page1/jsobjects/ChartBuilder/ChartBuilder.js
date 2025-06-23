export default {
	// ===================================================================
	// FONCTION POUR LE GRAPHIQUE EN BARRES (pour les films)
	// ===================================================================
	buildChart: (data) => {
		const movieTitles = data.map(film => film.Titre);
		const movieValues = data.map(film => film.Budget);

		const option = {
			title: {
				text: 'Budget des Films',
				left: 'center'
			},
			tooltip: {
				trigger: 'axis'
			},
			xAxis: {
				type: 'category',
				data: movieTitles,
				axisLabel: {
					interval: 0,
					rotate: 30
				}
			},
			yAxis: {
				type: 'value'
			},
			series: [{
				name: 'Budget',
				data: movieValues,
				type: 'bar'
			}],
			grid: {
				top: '15%',
				left: '5%',
				right: '5%',
				bottom: '20%'
			}
		};

		return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
            </head>
            <body style="margin:0; padding:0;">
              <div id="chart" style="width: 100%; height: 100vh;"></div>
              <script type="text/javascript">
                var myChart = echarts.init(document.getElementById('chart'));
                myChart.setOption(${JSON.stringify(option)});
                window.onresize = function() { myChart.resize(); };
              </script>
            </body>
          </html>
        `;
	},

	// ===================================================================
	// FONCTION POUR LE GRAPHIQUE CAMEMBERT (pour les statuts VFX)
	// ===================================================================
	buildPieChart: (chartData) => {
		const option = {
			title: {
				text: 'Répartition des Statuts VFX',
				left: 'center',
				textStyle: {
					color: '#333',
					fontWeight: 'bold',
					fontSize: 20
				}
			},
			tooltip: {
				trigger: 'item',
				formatter: '{b} : {c} plans ({d}%)'
			},
			legend: {
				orient: 'vertical',
				left: 'left',
				top: '15%'
			},
			series: [{
				name: 'Statuts VFX',
				type: 'pie',
				radius: '65%',
				center: ['55%', '60%'],
				data: chartData,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				}
			}]
		};

		return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
            </head>
            <body style="margin:0; padding:0;">
              <div id="chart" style="width: 100%; height: 100vh;"></div>
              <script type="text/javascript">
                var myChart = echarts.init(document.getElementById('chart'));
                myChart.setOption(${JSON.stringify(option)});
                window.onresize = function() { myChart.resize(); };
              </script>
            </body>
          </html>
        `;
	}
}