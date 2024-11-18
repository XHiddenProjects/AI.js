class math{
    constructor(){

    }

    

    /**
     * Checks if the object is left/on/right of the diagonal line
     * @param {Number} x Objects X-position
     * @param {Number} y Objects Y-position
     * @param {Number} x1 Start line X-position
     * @param {Number} y1 Start line Y-position
     * @param {Number} x2 End line X-position
     * @param {Number} y2 End line Y-position
     * @returns 
     */
    isDiagonal(x, y, x1, y1, x2, y2) {
        const v1 = [x2 - x1, y2 - y1];
        const v2 = [x - x1, y - y1];
        const cp = v1[0] * v2[1] - v1[1] * v2[0];
        if (cp > 0) return 1;
        if (cp < 0) return -1;
        return 0;
    }

    /**
     * Returns the slope
     * @param {Number} x1 Starting X-position
     * @param {Number} y1 Starting Y-position
     * @param {Number} x2 Ending X-position
     * @param {Number} y2 Ending Y-position
     * @returns {Number} Slope
     */
    getSlope(x1,y1,x2,y2){
        return (y2-y1)/(x2-x1);
    }

    /**
     * Gets the diagonal percentage
     * @param {[{x: Number[], y: Number[]}]} objects List of vertexes
     * @param {Number} slope The slope of the diagonal line
     * @param {Number} diagonalYIntercept Y-intercept
     * @param {Number} [threshold=10] How close do you want the dots to be to the line.
     * @returns {Number} Percentage
     */
    getDiagonalPercentage(objects, slope, diagonalYIntercept, threshold=10){
        let nearCount = 0;
        const diagonalLineDistance = (x, y) => Math.abs(slope * x - y + diagonalYIntercept) / Math.sqrt(slope ** 2 + 1);
        objects.forEach((object) => {
            const distance = diagonalLineDistance(object.x, object.y);
            if (distance <= threshold) {
                nearCount++;
            }
        });
        return ((nearCount / objects.length) * 100);
    }

    coords2arr(matrix){
        const mtx = [];
        matrix.forEach(e=>{
            if(!e.z) mtx.push([e.x,e.y]);
            else mtx.push([e.x,e.y,e.z]);
        });
        return mtx;
    }
    
    /**
     * Gets the Correlation Coefficient
     * @param {Number} x X-Coords
     * @param {Number} y Y-Coords
     * @returns {String} The correlation and coefficient
     */
    getCC(x, y) {
        const n = Math.min(x.length, y.length);
        let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;

        for (let i = 0; i < n; i++) {
            const xi = x[i];
            const yi = y[i];
            sumXY += xi * yi;
            sumX += xi;
            sumY += yi;
            sumX2 += xi * xi;
            sumY2 += yi * yi;
        }

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator !== 0 ? ((numerator / denominator) > 0 ? `${(numerator / denominator).toFixed(2).match('0.00') ? 'No Relationship' : '+'+(numerator / denominator).toFixed(2)}` : `${(numerator / denominator).toFixed(2).match('0.00') ? 'No Relationship' : (numerator / denominator).toFixed(2)}`) : 'No Relationship'; // Handle division by zero
    }

    /**
     * Separates the matrix into individual arrays
     * @param {Array.<Number[]>} matrix Matrix to sort
     * @returns {{x: Number[], y: Number[], z: Number[]}}
     */
    sortCoords(matrix){
        const x = [];
        const y = [];
        const z = [];
        matrix.forEach((e)=>{
            if((e.x&&e.y)||(e.x&&e.y&&e.z)){
                x.push(e.x);
                y.push(e.y);
                if(e.z) z.push(e.z);
            }else{
                x.push(e[0]);
                y.push(e[1]);
                if(e[2]) z.push(e[2]);
            }
        });
        return {'x': x, 'y': y, 'z': z};
    }

    /**
     * Calculates the slope
     * @param {Array.<Number[]>} points Coordinates points
     * @returns {{points: Number[], slope: Number, yIntercept: Number, xIntercept: Number, OneSlope: Number, equation: String}} Regression information
     */
    calcRegression(points){
        const dataPoints = [],
            maxLength = points[points.length-1][0];

        //Slopes

        const x =[], y=[];
        points.forEach(p=>{
            x.push(p[0]);
            y.push(p[1]);
        });

    const BestFit = (xValues, yValues)=>{
        const n = xValues.length;
        const meanX = xValues.reduce((acc, curr) => acc + curr, 0) / n;
        const meanY = yValues.reduce((acc, curr) => acc + curr, 0) / n;

        const deviationsX = xValues.map(x => x - meanX);
        const deviationsY = yValues.map(y => y - meanY);

        const covariance = deviationsX.reduce((acc, curr, idx) => acc + curr * deviationsY[idx], 0) / (n - 1);
        const varianceX = deviationsX.reduce((acc, curr) => acc + Math.pow(curr,2), 0) / (n - 1);

        const slope = covariance / varianceX;
        const intercept = meanY - slope * meanX;

        return { slope, intercept };
    }

        
        const xIntercept = (-BestFit(x,y).intercept) / BestFit(x,y).slope;

        const negSlope = 1/BestFit(x,y).slope;

        dataPoints.push({x: 0, y: BestFit(x,y).intercept});
        for(let i=1;i<maxLength;i++){
            const newX = dataPoints[i-1]['x']+1,
            newY = BestFit(x,y).slope*newX+BestFit(x,y).intercept
            dataPoints.push({x: newX, y: newY});
        }
        return {'points': dataPoints, 
            'slope': BestFit(x,y).slope, 
            'yIntercept': BestFit(x,y).intercept,
            'xIntercept': xIntercept,
            'OneSlope': negSlope,
            'equation': `Y=${BestFit(x,y).slope}x+${BestFit(x,y).intercept}`};
    }
}
window.math = math;