/**
  * Creates a chart using the matrix values
  * @param {HTMLElement} target Element to insert chart
  * @param {String} ctx Canvas class name
  */
class chartJS {
    #t;
    #tar;
    constructor(target) {
        if (!window.Chart)
            throw new ReferenceError('Missing Chart.js\nCheck out: https://www.chartjs.org/docs/latest/getting-started/installation.html');
        if(!window.math)
            throw new ReferenceError('./utils/Math.js file must be included');
            
        this.selections = [];
        this.#t = target;
        this.#tar = '';
    }
    /**
     * Adds a bot to the list
     * @param {...GameAI|SearchAI} bot Bot list
     */
    add(...bot) {
        this.selections = bot;
        const IDList = [];
        this.#tar = Object.keys(bot[0])[0];
        bot.map((e) => {if (IDList.includes(e[this.#tar].accessKey)) throw new ReferenceError('Access key already exists'); else IDList.push(e[this.#tar].accessKey); });
    }
    /**
     * Generates a linear regression chart
     * @param {String} pointsColor Set the color of the points
     * @param {String} lineColor Set the color of the line
     */
    linearRegression(pointsColor='#000', lineColor='rgba(0,0,0,0.5)') {
        let bCount = document.querySelectorAll('.chart').length;
        this.selections.forEach((e) => {
            //Create Canvas
            const canvas = document.createElement('canvas');
            canvas.className = `chart bot${bCount}`;
            document.querySelector(this.#t).appendChild(canvas);

            //Create chart
            const datapoints = e[this.#tar]['attributes']['matrix'].map((p)=>{
                return {
                    x: p[0],
                    y: p[1]
                }
            });
            let suggestYMin = 0, suggestYMax = 0, suggestXMax=0; 
            e[this.#tar]['attributes']['matrix'].forEach((e)=>{
                if(suggestYMin<e[1]) suggestYMin = e[1];
                if(suggestYMax>e[1]) suggestYMax = e[1];
                if(suggestXMax>e[0]) suggestXMax = e[0];
            });
            const m = new math(),
            getLinePoints = m.calcRegression(e[this.#tar]['attributes']['matrix']);
            new Chart(document.querySelector(`.bot${bCount}`),{
                type: 'scatter',
                data:{
                    datasets:[{
                        type: 'scatter',
                        data: datapoints,
                        backgroundColor: pointsColor
                    },
                    {
                        type: 'line',
                        label: '',
                        data: getLinePoints.points,
                        borderColor: lineColor,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins:{
                        legend:{
                            display: false
                        }
                    },
                    scales: {
                        x:{
                            suggestedMin: 0,
                            suggestedMax: Math.ceil(suggestXMax),
                            title:{
                                display: true,
                                text: 'X',
                                font: {size: 25, weight: 'bold'}
                            }
                        },
                        y: {
                            suggestedMin: Math.floor(suggestYMin - 40),
                            suggestedMax: Math.ceil(suggestYMax + 20),
                            title:{
                                display: true,
                                text: 'Y',
                                font: {size: 25, weight: 'bold'}
                            }
                        }
                    }
                }
            });

            //New botID
            bCount+=1;
        });
    }
    /**
     * Creates a bar chart 
     * @param {String[]} xKey Key that contain arrays
     * @param {String[]} yKey Values to take
     * @param {string} [pos='x'] Change the position of the bar. **X** or **Y**
     */
    bar(xKey,yKey,pos='x'){
        let bCount = document.querySelectorAll('.chart').length;
        const colors = [],
        randomHexColor = ()=>{
            const maxVal = 0xFFFFFF; // 16777215
            const randomNumber = Math.floor(Math.random() * maxVal);
            return `#${randomNumber.toString(16).padStart(6, '0')}`;
        };
        this.selections.forEach((e) => {
            //Create Canvas
            const canvas = document.createElement('canvas');
            canvas.className = `chart bot${bCount}`;
            document.querySelector(this.#t).appendChild(canvas);

            const o1 = Object.values(e);
            const x = [], y=[];

            xKey.forEach(i=>{
                const k = (new window.keys()).selection(o1,i,'');
                x.push(k);
            });
            yKey.forEach(i=>{
                const k = (new window.keys()).selection(o1,i,'');
                y.push(k);
            });
        
            for(let c=0;c<x.length;c++) colors.push(randomHexColor());

            new Chart(document.querySelector(`.bot${bCount}`),{
                type: 'bar',
                data:{
                    labels: x,
                    datasets:[{
                        label: '',
                        data: y,
                        backgroundColor: colors
                    }]
                },
                options: {
                    responsive: true,
                    plugins:{
                        legend:{
                            display: false
                        }
                    },
                    indexAxis: pos.toLocaleLowerCase()
                }
            });
            bCount+=1;
        });
        
    }
}
window.chartjs = chartJS;