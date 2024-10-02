class Data {
    
    //* VARIABLES FOR USAGE
    static x = [];
    static y = [];
    static z = [];
    static coord_id = [];       
    static colors = [];
    static colorMap = {}; //HASH WITH THE CLUSTER LABEL AND CORRESPONDING COLOR

    static coordinates; 
    static account_data;
    static cluster_data;
    static global_data;

    static randomColors = [ //Random colors to assign to clusters
        '#94c4a0', '#6830bc', '#3b86dc', '#52a6c7', '#c738ba', 
        '#aaf63a', '#f038a1', '#a0ae7e', '#b354d5', '#6870b1', 
        '#03ecde', '#6b9317', '#608975', '#9136e3', '#9c1ec7', 
        '#c1802b', '#2aa568', '#c4f86f', '#6e9cd0', '#4a7aab', 
        '#2fd9f4', '#5d60eb', '#0bc57c', '#1ffd94', '#970b39', 
        '#6a540c', '#cd0982', '#315149', '#d033ae', '#ad5bee', 
        '#f2dbdf', '#306604', '#38cc14', '#f95868', '#2d6f79', 
        '#1f7e7a', '#455394', '#ad8a7d', '#64c2c4'
    ];

    

    constructor(data) { //pass the fetched data to our class and initialize the main variables
        Data.account_data = data.account_data;
        Data.cluster_data  = data.cluster_data;
        Data.coordinates = data.coordinates;
        Data.global_data = data.global_data;
    }

    static populateCoordinates(){ // COORDINATES POPULATE FUNCTION
        for (const key in Data.coordinates){ 
            const point = Data.coordinates[key];
            Data.x.push(point[0]);
            Data.y.push(point[1]);
            Data.z.push(point[2]);
            Data.coord_id.push(key)
        }
    }
    
    static populateColors(){ //ASSIGN THE COLORS TO POINTS
        for (let i = 1; i <= 39; i++){
            Data.colorMap = { //Create a Hash of Cluster Label: Color
                ...Data.colorMap, 
                [i]: Data.randomColors[i - 1]
            } 
        }
    
        
        for (const acc in Data.account_data) { //Assign a color to each account
            const account = Data.account_data[acc];
            const colr = Data.colorMap[account["cluster_label"]]
            Data.colors.push(colr)
        }
    }
    
}

function getPointData(id, rData){ //Function to fetch data from the point
    return {
        'followers': rData[`${id}`].profile.fl,        
        'friends': rData[`${id}`].profile.fr,        
        'tweets': rData[`${id}`].profile.tw,
        'picture_pth': rData[`${id}`].picture_path,         
        'neighbors': rData[`${id}`].neighbors,    
        'clusterLabel': rData[`${id}`].cluster_label,
        'botscore': rData[`${id}`].botscore,
        'ideology': rData[`${id}`].ideology,
    }
  }

export { Data, getPointData };