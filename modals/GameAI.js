/**
 * GameAISelection
 */
class GameAISelection{
    /**
     * Returns Selection object
     * @param {Array.<{}>} bots AI object
     * @param {String} tag AI tag
     * @returns {this}
     */
    constructor(bots, tag){
        const selection = bots.tag===tag ? bots : {};
        return selection;
    }
}
/**
 * GameAITimer
 */
class GameAITimer{
    /**
     * Renders as a Timer object
     * @param {Number} time The amount of time in **(seconds)**
     * @param {'s'|'m'|'h'|'d'} [measure='s'] How long does the timer last. **s=seconds, m=minutes, h=hours, d=days**
     * @param {boolean} [loopback=false] Loop the clock infinitely.
     * @returns {this}
     */
    constructor(time, measure='s', loopback=false){
        switch(measure.toLocaleLowerCase()){
            case 'm':
                time*=60;
            break;
            case 'h':
                time*=3600;
            break;
            case 'd':
                time*=86400;
            break;
            default:
                time=time;
            break;
        }
        this.is_ticking = false;
        this.set = time;
        this.current = time;
        this.interval = 1000;
        this.loop = loopback;
        this.timer;
        this.stop=false;
        return {
            set: this.set, 
            current: this.current, 
            interval: this.interval, 
            is_ticking: this.is_ticking, 
            loop: this.loop,
            /**
             * Checks if the timer is currently ticking
             * @returns {Boolean} True if the time is ticking, else FALSE.
             */
            isTicking: ()=>{
                return this.is_ticking;
            },
            /**
             * Starts the timer
             * @param {{ onInterval: Function|null; onComplete: Function|null; }} [func={onInterval: null, onComplete: null}] **onInterval**: Triggers function on tick. **onComplete**: Triggers function on finish.
             */
            start(callback={onInterval: null, onComplete: null}){
                const f = this.timer;
                this.is_ticking=true;
                this.timer = setInterval(()=>{
                    if(this.is_ticking){
                        if(this.current<=0){
                            if(!this.loop) clearInterval(this.timer);
                            else this.current = this.set;
                            if(callback.onComplete) callback.onComplete(this.set);
                        }else{
                            this.current-=1;
                            if(callback.onInterval) callback.onInterval(this.current);
                            
                        }
                    }
                },this.interval);
            },
            /**
             * Stop the timer
             * @param {{ onComplete: Function|null; }} [callback={onComplete: null}] **onComplete** triggers a function on complete
             * @returns 
             */
            stop(callback={onComplete: null}){
                this.is_ticking = false;
                clearInterval(this.timer);
                if(callback.onComplete) callback.onComplete();
            },
            /**
             * Pauses timer
             * @param {GameAITimer} timer GameAITimer
             * @param {{ onPause: Function|null; }} [callback={onPause: null}] **onPause:** Triggers function on pause
             */
            pause(callback={onPause: null}){
                this.is_ticking = false;
                if(callback.onPause) callback.onPause();
            },
            /**
             * Resumes the timer
             * @param {GameAITimer} timer GameAITimer
             * @@param {{ onResume: Function|null; }} [callback={onResume: null}] Triggers function on resume
             */
            resume(callback={onResume: null}){
                this.is_ticking = true;
                if(callback.onResume) callback.onResume();
            },
            /**
             * Puts the timer to sleep for X amount of time
             * @param {Function} callback Callback after sleep
             * @param {Number} timeout The time to sleep, in **ms(milliseconds)**
             */
            sleep(callback, timeout){
                setTimeout(()=>{
                    callback();
                },timeout);
            },
            /**
             * Returns the set time
             * @returns {Number} Time amount
             */
            getSetTime(){
                return this.set;
            },
            /**
             * Resets the timer
             */
            reset(){
                this.current = this.set;
            }
        };
    }
}
/**
 * GameAIObjects
 */
class GameAIObjects{
    /**
     * Creates a matrix for objects
     * @returns {this}
     */
    constructor(b){
        this.tag = b;
        this.matrix = [];
        this.generation = 1;
        return this;
    }
    /**
     * Adds an object to the matrix
     * @param {Array.<Number>} obj Array to add to matrix
     * @returns {void}
     */
    add(obj){
        this.matrix.push(obj);
    }
    /**
     * Returns the matrix
     * @param {number} [id=-1] Get the selectionID
     * @returns {Array.<Array.<Number>>} Matrix
     */
    get(id=-1){
        return (id>=0 ? this.matrix[id] : this.matrix);
    }

    /**
     * Clears out the matrix
     */
    clear(){
        this.matrix = [];
    }
    /**
     * Adds a generation to the object
     */
    gen(){
        this.generation+=1;
    }


    /**
     * Returns the objects information
     * @returns 
     */
    array(){
        const obj = {x: [], y: [], z: [], gen: this.generation};
        this.matrix.forEach((vertex)=>{
            obj.x.push(vertex.x);
            obj.y.push(vertex.y);
            if(vertex.z) obj.z.push(vertex.z); 
        });

        return obj;
    }
}


/**
 * GameAI generator
 */
class GameAI{
    /**
     * Creates an AI for video games
     * 
     * @param {{tag: string, 
     * rotation: Array.<{x:number, y:number, z: number}>, 
     * facing: Array.<{x: number, y: number, z: number}>, 
     * position: Array.<{x: number, y: number, z: number}>}} b Lists of bots to train
     */
    constructor(b){
            if(!window.keys) throw new ReferenceError("Keys has not been rendered!");
            this.bots = b;   
            this.timer;
            this.objs = new GameAIObjects(b.tag);
            this.steps = new Array();
            this.bots['accessKey'] = (new window.keys()).GenerateAccessKey();
            return this;
    }
    /**
     * Selects the AI you want to modify
     * @param {String} tag Bots name
     * @returns {GameAISelection} Selected bot object
     */
    select(tag){
        return (new GameAISelection(this.bots,tag));
    }
    /**
     * Returns the object of the type
     * @param {GameAISelection} selection AIs selection
     * @param {String} [type='*'] Data that you want to pull. Use _"," (comma)_ to split selection.
     * @param {mixed} [err=false] Return default value if failed
     * @returns {mixed} Returns the selected target. False if selection has not been found.
     */
    get(selection,type='*',err=false){
        let select=null;
        if(type==='*')
            return selection;
        else{
            if(type.split(',').length>0){
                type.split(',').forEach(t=>{
                    if((!select&&selection[t])||(select&&select[t])) select = !select ? selection[t] : select[t];
                    else select=err;
                });
            }else{
                if(selection[type]) select = selection[type]; 
                else select = err;
            }
            return select;
        }
    }

    set(selection,type,value){
        // Split the type string into an array of keys
        const keys = type.split(',');

        // Use reduce to traverse the object and set the value
        const lastKey = keys.pop(); // Get the last key to set the value
        const target = keys.reduce((obj, key) => {
            // Create nested objects if they don't exist
            if (!obj[key]) {
                obj[key] = {};
            }
            return obj[key];
        }, selection);

        // Set the value at the target location
        target[lastKey.trim()] = value;
    }

    // Rewarded/Punished //
    /**
     * 
     * @param {GameAISelection} selection AI to select
     * @param {Array.<Array>} reward Reward object
     * @returns {GameAISelection}
     */
    reward(selection, reward){
        selection['attributes']['matrix'].push(reward);
        return selection['attributes']['matrix'];
    }
    /**
     * 
     * @param {GameAISelection} selection AI to select
     * @param {Array.<Array>} punish Punishment object
     * @returns {GameAISelection}
     */
    punish(selection, punish){
        selection['attributes']['matrix'] = selection['attributes']['matrix'].filter((e)=>{return e.toString()!==punish.toString()});
        return selection['attributes']['matrix'];
    }

    // TIMER //

    /**
     * Creates a timer object
     * @param {Number} time The amount of time in **(seconds)**
     * @param {'s'|'m'|'h'|'d'} [measure='s'] How long does the timer last. **s=seconds, m=minutes, h=hours, d=days**
     * @param {boolean} [loopback=false] Loop the clock infinitely.
     * @returns {GameAITimer}
     */
    createTimer(time,measure='s', loopback=false){
        return (new GameAITimer(time,measure,loopback));
    }

    // MATH //

    /**
     * Generates a random number
     * @param {Number} [min=0] Minimum number (inclusive)
     * @param {Number} [max=1] Maximum number (exclusive)
     * @param {boolean} [inclusive=false] Include maximum
     * @param {boolean} [rounded=false] Round the numbers
     * @returns 
     */
    generateRand(min=0, max=1,inclusive=false, rounded=false){
        if(inclusive){
            if(rounded)
                return parseInt((Math.random() * (max - min + 1)) + min);
            else
                return Math.random() * (max - min + 1) + min;
        }else{
            if(rounded)
                return parseInt((Math.random() * (max - min)) + min);
            else
                return Math.random() * (max - min) + min;
        }
    }
    /**
     * Repeats callback
     * @param {Function} callback Function to callback
     * @param {Number} [times=1] Number of times to call
     */
    repeat(callback, times=1){
        if(times<1)
            throw new AggregateError("You must have a number greater");
        for(let l=0;l<times;l++) callback();
    }
    /**
     * Adds vertex to matrix
     * @param {Array.<{x: number, y: number, z: number}>} obj Array of vertex
     */
    addVertex(obj){
        this.objs.add(obj);
    }
    /**
     * Get Matrix of vertexes
     * @param {Number} id Get matrix ID. 
     * @returns {Array.<{x: number, y: number, z: number}>} Matrix
     */
    getVertex(id){
        return this.objs.get(id);
    }
    /**
     * Clears out the vertexes from the matrix
     */
    clearVertex(){
        this.objs.clear();
    }

    toVertexArray(){
        return this.objs.array();
    }
    /**
     * Adds a generation
     */
    addGen(){
        this.objs.gen();
    }
    /**
     * Allows the AI to continue, to prevent multi-task
     * @returns {Boolean}
     */
    canContinue(){
        return this.addGenAllow;
    }

    /**
     * Trains the object on your behalf
     * @param {Function} callback The callback of how you want the training to be proceeded as.
     * @param {boolean} [isTraining=true] Tells the AI if it's in training mode.
     * @returns {Function|null} The results of the training, Null if training has ended.
     */
    train(callback,isTraining=true){
        if(!this.stop){
                if(this.bots.tag==this.objs.tag) this.bots['attributes'] = this.objs;
            return callback(this.bots, isTraining);
        }else return null;
    }
    /**
     * Ends the training process
     */
    end(){
        const resultMatrix = [];
        let updatedMatrix;
        let lastIndex = [], remLastIndex=true;
        (new Set(this.steps.map(JSON.stringify))).forEach(row => {
            // Convert stringified row back to array
            const newRow = JSON.parse(row);
            // Add new row to result matrix
            resultMatrix.push(newRow);
        });

        resultMatrix.forEach((e)=>{
            if(e[2]===(lastIndex[lastIndex.length-1] ? lastIndex[lastIndex.length-1] : 0))
                remLastIndex = remLastIndex;
            else
                remLastIndex = false;
        });

        if(remLastIndex)
            updatedMatrix = resultMatrix.map((row)=>{return row.slice(0,-1);});
        else
            updatedMatrix = resultMatrix;

        this.bots['attributes']['matrix'] = updatedMatrix;
        this.stop=true;
        return this.bots;
    }
    /**
     * Returns the bot starting position
     * @param {Number} x X Position
     * @param {Number} y Y Position
     * @param {Number} [z=0] Z Position
     */
    reset(x,y,z=0){
        this.steps = [[x,y,z]];
        this.objs.matrix = [[x,y,z]];
    }

    addStep(vertex){
        const exists = this.steps.some((row,index)=>{
            return JSON.stringify(row)===JSON.stringify(vertex);
        });
       // console.log(this.steps);
        if(!exists)
            this.steps.push([...vertex]);
    }

}
