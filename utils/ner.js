/**
 * Named Entity Recognition
 */
class NER{
    /**
     * Add a text to get the NER
     * @returns {NER}
     */
    constructor(){
        this.dictionary = {
            person: {list: [], return: 'person'},
            organization: {list: [], return: 'organization'},
            location: {list: [], return: 'location'},
            date: {list: ['now'], return: 'date'},
            time: {list:['now'], return: 'time'},
            quantity: {list: [/[\d]+/], return: 'quantity'},
            monetaryValue: {list: [/([£$€]\d+(?:,\d{3})*(?:\.\d{1,2})?)/], return: 'monetary'},
            percentage: {list: [/\d+(?:\.\d+)?%/], return: 'percentage'}
        }
        return this;
    }
    /**
     * Adds a sub-dictionary to the dictionary
     * @param {String} name Name of the sub-dictionary
     * @param {String} out The name to return as a label
     * @returns {NER}
     */
    addDictionary(name, out){
        if(!this.dictionary[name.toLocaleLowerCase()])
            this.dictionary[name.toLocaleLowerCase()] = {list: [], return: out.toLocaleLowerCase()};
        return this;
    }
    /**
     * Removes a sub-dictionary
     * @param {String} name Name of the sub-dictionary
     * @returns {NER}
     */
    removeDictionary(name){
        delete this.dictionary[name.toLocaleLowerCase()];
        return this;
    }
    /**
     * Add an item to the dictionary
     * @param {String} target Dictionary target
     * @param {RegExp|String} item Regexpresion or string to insert
     * @returns {NER}
     */
    addItem(target, item){
        if(!this.dictionary[target.toLocaleLowerCase()]['list'].includes(item))
            this.dictionary[target.toLocaleLowerCase()]['list'].push(item);
        else throw new ReferenceError(`${item} already exists in ${target}`)
        return this;
    }
    /**
     * Removes an item from array
     * @param {String} target Dictionary target
     * @param {RegExp|String} item Item to remove
     * @returns {NER}
     */
    removeItem(target,item){
        if(this.target[target.toLocaleLowerCase()]['list'].includes(item)){
            const index = this.target[target.toLocaleLowerCase()]['list'].indexOf(item);
            if (index !== -1)  this.target[target.toLocaleLowerCase()]['list'].splice(index, 1);
        }else throw new RangeError(`${item} is not inside the ${target} dictionary`);
        return this;
    }
    getData(txt){
        let correctEntities = 0,
        predictedEntites = [],
        grantedEntites = [];
        predictedEntites.push(...Object.keys(this.dictionary));
        predictedEntites.forEach(entities=>{
            if(this.dictionary[entities]['list'].includes(txt)) {
                grantedEntites.push(entities);
                correctEntities++;
            }
        });

        const precision = correctEntities / predictedEntites.length,
        recall = correctEntities / Object.keys(this.dictionary).length;
        let f1Score = 2 * (precision * recall) / (precision + recall);
        f1Score = isNaN(f1Score) ? 0 : f1Score;
        return { precision: precision, recall: recall, f1Score: f1Score, predictedEntites: grantedEntites};
    }
}