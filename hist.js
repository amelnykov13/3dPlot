function createVegaBarChart(ideologyGlobal, ideologyCluster, botscoreGlobal, 
                    botscoreCluster, pointIdeology, pointBotscore) {
  try {
    const vegaLiteSpec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      
    
      "vconcat": [
        {
          "description": "Bar Chart for Ideology with Combined Layer",
          "width": 300,
          "height": 120,
          
          "layer": [
            {
              "data": {
                "values": ideologyGlobal["bins"].map((bin, index) => ({
                  "bin": bin,
                  "density": ideologyGlobal["density"][index]
                }))
              },
              "mark": {
                "type": "bar",
                "color": "#808080",
                'xOffset': 0, // Set bar color to grey,
                
              },
              "encoding": {
                "x": {
                  "field": "bin",
                  "type": "quantitative",
                  "axis": {"title": "Ideology", "grid": false},
                  "scale": {"domain": [-3, 2]},
                  
                },
                "y": {
                  "field": "density",
                  "type": "quantitative",
                  "axis": {"title": "Density", "grid": false},
                  "scale": {"domain": [0, 6], "clamp": true}
                }
              }
            },
            
            //* BLUE CLUSTER LAYER
            {
              "data": {
                "values": ideologyCluster['bins'].map((bin, index) => ({
                  "bin": bin,
                  "density": ideologyCluster['density'][index]
                }))
              },
              "mark": {
                "type": "bar",
                "fillOpacity": 0,       // Make the bar fill transparent
                "stroke": "blue",       // Set border color to blue
                "strokeWidth": 1,
                
                      // Set border width
                  
              },
              "encoding": {
                "x": {
                  "field": "bin",
                  "type": "quantitative",
                  "axis": {"title": "", "grid": false},
                  "scale": {"domain": [-3, 2]}
                },
                "y": {
                  "field": "density",
                  "type": "quantitative",
                  "axis": {"title": "Density", "grid": false},
                  "scale": {"domain": [0, 6], "clamp": true}
                }
              }
            },

            //* RED LINE 
            {
              "data": {
                'values': [{ 'x': pointIdeology}]
                
              },
              "mark": "rule",
              "encoding": {
                "x": {
                  "field": "x", 
                  "type": 'quantitative', 
                  "axis": {"title": "", "grid": false},
                  "scale": {"domain": [0, 1]}
                },
                "color": {"value": "red"},
                "size": {"value": 1.5}
              }
            }

          

          ]
        },






        // * SECOND PLOT
        
        {
          "description": "Bar Chart for Botscore with Combined Layer",
          "width": 300,
          "height": 120,
          "layer": [
            {
              "data": {
                "values": botscoreGlobal['bins'].map((bin, index) => ({
                  "bin": bin,
                  "density": botscoreGlobal['density'][index]
                }))
              },
              "mark": {
                "type": "bar",
                "color": "#808080",
            
              },
              "encoding": {
                "x": {
                  "field": "bin",
                  "type": "quantitative",
                  "axis": {"title": "Botscore", "grid": false},
                  "scale": {"domain": [0, 1]}
                },
                "y": {
                  "field": "density",
                  "type": "quantitative",
                  "axis": {"title": "Density", "grid": false},
                  "scale": {"domain": [0, 6], "clamp": true}
                }
              }
            },
      
            //* BLUE CLUSTER LAYER
            {
              "data": {
                "values": botscoreCluster['bins'].map((bin, index) => ({
                  "bin": bin,
                  "density": botscoreCluster['density'][index]
                }))
              },
              "mark": {
                "type": "bar",
                "fillOpacity": 0,       // Make the bar fill transparent
                "stroke": "blue",       // Set border color to blue
                "strokeWidth": 1,
           // Set border width
              },
              "encoding": {
                "x": {
                  "field": "bin",
                  "type": "quantitative",
                  "axis": {"title": "", "grid": false},
                  "scale": {"domain": [0, 1]}
                },
                "y": {
                  "field": "density",
                  "type": "quantitative",
                  "axis": {"title": "Density", "grid": false},
                  "scale": {"domain": [0, 6], "clamp": true}
                }
              }
            },

            //* RED LINE 
            {
              "data": {
                'values': [{ 'x': pointBotscore }]
                
              },
              "mark": "rule",
              "encoding": {
                "x": {
                  "field": "x", 
                  "type": 'quantitative', 
                  "axis": {"title": "", "grid": false},
                  "scale": {"domain": [0, 1]}
                },
                "color": {"value": "red"},
                "size": {"value": 1.5}
              }
            }

          ]
        }
      ]
    };



    
    // Embed the Vega-Lite specification in the container
    vegaEmbed('#vega-histogram', vegaLiteSpec, { actions: false })
      .then(result => {
        console.log('Vega-Lite visualization rendered successfully');
      })
      .catch(err => {
        console.log(err);
      });

  } catch (err) {
    console.log(err);
  }
}

// * Function to reset histogram on the outside click
function resetVegaChart(ideologyGlobal, botscoreGlobal) {
  try {
    const vegaLiteSpec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      
      
      "vconcat": [
        {
          "description": "Bar Chart for Ideology with Combined Layer",
          "width": 300,
          "height": 120,
          "layer": [
            {
              "data": {
                "values": ideologyGlobal["bins"].map((bin, index) => ({
                  "bin": bin,
                  "density": ideologyGlobal["density"][index]
                }))
              },
              "mark": {
                "type": "bar",
                "color": "#808080",
                'xOffset': 0, // Set bar color to grey,
                
              },
              "encoding": {
                "x": {
                  "field": "bin",
                  "type": "quantitative",
                  "axis": {"title": "Ideology", "grid": false},
                  "scale": {"domain": [-3, 2]},
                  
                },
                "y": {
                  "field": "density",
                  "type": "quantitative",
                  "axis": {"title": "Density", "grid": false},
                  "scale": {"domain": [0, 6], "clamp": true}
                }
              }
            },
          

          ]
        },






        // * SECOND PLOT
        
        {
          "description": "Bar Chart for Botscore with Combined Layer",
          "width": 300,
          "height": 120,
          "layer": [
            {
              "data": {
                "values": botscoreGlobal['bins'].map((bin, index) => ({
                  "bin": bin,
                  "density": botscoreGlobal['density'][index]
                }))
              },
              "mark": {
                "type": "bar",
                "color": "#808080",
            
              },
              "encoding": {
                "x": {
                  "field": "bin",
                  "type": "quantitative",
                  "axis": {"title": "Botscore", "grid": false},
                  "scale": {"domain": [0, 1]}
                },
                "y": {
                  "field": "density",
                  "type": "quantitative",
                  "axis": {"title": "Density", "grid": false},
                  "scale": {"domain": [0, 6], "clamp": true}
                }
              }
            },
       

          ]
        }
      ]
    };



    
    // Embed the Vega-Lite specification in the container
    vegaEmbed('#vega-histogram', vegaLiteSpec, { actions: false })
      .then(result => {
        console.log('Vega-Lite visualization rendered successfully');
      })
      .catch(err => {
        console.log(err);
      });

  } catch (err) {
    console.log(err)
  }
}

export { createVegaBarChart, resetVegaChart };
