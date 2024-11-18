class searchAI{
    /**
     * Creates an AI for searching
     * 
     * @param {{tag: String, searches: [{searchKey: String, redirectKey: String}], input: HTMLInputElement, button: HTMLButtonElement, top: Number}} b Lists of bots to train
     * @param {string} [lookup=''] Check for search key in JSON object
     * @param {string} [redirect=''] Checks for redirect key in JSON object
     */
    constructor(b, lookup='', redirect=''){
        if(!window.keys) throw new ReferenceError("Keys has not been rendered!");
        if(!b.input.type.match(/^search|text$/i)) throw new ReferenceError('Input type must be a search/text');
        const searches = [];
        /**
         * Removes any duplicated text by object key
         * @param {[]} arr Search objects
         * @param {String} key Key to check in the array for duplicate text
         * @returns {[{}]} Filtered search object
         */
        const removeDuplicates = (arr, key) => {
            // Create a Set to store the normalized keys
            const seen = new Set();
            // Filter out the duplicates by normalizing the key and checking if it's already in the Set
            return arr.filter(item => {
              const normalizedKey = item[key].toLowerCase(); // Normalize the key to lowercase
            if (seen.has(normalizedKey)) {
                return false; // If the normalized key is already in the Set, skip this item
            }
              seen.add(normalizedKey); // Otherwise, add the normalized key to the Set
                return true;
            });
        };
        b.searches = removeDuplicates(b.searches,lookup);
        
        b.searches = b.searches.map(e=>{
            if(!e[lookup]) throw new SyntaxError('Lookup is invalid');
            searches.push({text: e[lookup], hits: 0, url: (e[redirect] ? e[redirect] : '')});
        });

        b.searches = searches;
        this.search = b;
        this.search['accessKey'] = (new window.keys()).GenerateAccessKey();
        return this;
    }
    /**
     * Sorts the searches
     * @param {[{}]} searches Search objects
     * @returns {[{}]} Sorted search objects
     */
    
    sortSearchHits(searches){
        return searches.sort((a,b)=>b.hits - a.hits);
    }

    /**
     * Makes the search bar searchable
     * @param {Function} callback returns searched object, _param1_ and searches, _param2_ 
     */
    searchable(callback){
        const replaceRegExp = (str)=>{
            const chars = [
                '.',
                '(',
                ')',
                '[',
                ']',
                '{',
                '}',
                '|',
                '^',
                '$',
                '*',
                '+',
                '?',
                '\\'
            ];
            chars.forEach(c=>{
                str = str.replaceAll(c,`\${c}`);
            });
            return str;
        };
        var isSelected = false;
        const container = document.createElement('div');
        container.classList.add('searchBox');
        container.tabIndex = '0';
        container.classList.add(`searchBox${document.querySelectorAll('.searchBox').length}`);
        container.innerHTML = `${this.search.input.outerHTML}
        ${this.search.button ? this.search.button.outerHTML : ''}
        <div class="results"></div>`;
        this.search.input.replaceWith(container);
        if(this.search.button) this.search.button.remove();
        container.querySelector('input').addEventListener('input',(e)=>{
            const v = e.target.value;
            const sort = this.sortSearchHits(this.search.searches);
            var list='',hitCount=0;
            if(v===''){
                sort.forEach((i)=>{
                    hitCount+=1;
                    if(hitCount<=this.search.top)
                        list+=`<div hit-redirect="${i.url}" hit-index="${i.hits}" class="result-item">${i.text}</div>`;
                });
                e.target.parentNode.querySelector('.results').innerHTML = list;
            }else{
                sort.forEach((i)=>{
                    hitCount+=1;
                    if((hitCount<=this.search.top)&&i.text.match(new RegExp(`${replaceRegExp(v)}`,'i')))
                        list+=`<div hit-redirect="${i.url}" hit-index="${i.hits}" class="result-item">${i.text}</div>`;
                });
                e.target.parentNode.querySelector('.results').innerHTML = list;
            }
            list = '';
            hitCount = 0;

            if(container.querySelectorAll('.result-item')){
                container.querySelectorAll('.result-item').forEach(e=>{
                    e.addEventListener('click',e=>{
                        e.target.parentNode.parentNode.querySelector('input').value = e.target.innerText;
                    });
                });
            }
        });
        window.addEventListener('click',(e)=>{
            if(!e.target.className.match(/aiSearch/)){
                document.querySelectorAll('.results').forEach(e=>{
                    e.innerHTML = ''
                });
            }
        });

        container.querySelector('input').addEventListener('click',()=>{
            container.querySelectorAll('.result-item').forEach(e=>{
                e.addEventListener('click',e=>{
                    if(!isSelected)
                        e.target.parentNode.parentNode.querySelector('input').value = e.target.innerText;
                });
            });
        });

        container.querySelector('input').addEventListener('focus',(e)=>{
            var list='', hitCount=0;
            const sort = this.sortSearchHits(this.search.searches);

            if(e.target.value===''){
                sort.forEach((i)=>{
                    hitCount+=1;
                    if(hitCount<=this.search.top)
                        list+=`<div hit-redirect="${i.url}" hit-index="${i.hits}" class="result-item">${i.text}</div>`;
                });
            }else{
                sort.forEach((i)=>{
                    hitCount+=1;
                    if((hitCount<=this.search.top)&&i.text.match(new RegExp(`${replaceRegExp(e.target.value)}`,'i')))
                        list+=`<div hit-redirect="${i.url}" hit-index="${i.hits}" class="result-item">${i.text}</div>`;
                });
                e.target.parentNode.querySelector('.results').innerHTML = list;
            }
            e.target.parentNode.querySelector('.results').innerHTML = list;
            list = '';
            if(container.querySelectorAll('.result-item')){
                container.querySelectorAll('.result-item').forEach(e=>{
                    e.addEventListener('click',e=>{
                        e.target.parentNode.parentNode.querySelector('input').value = e.target.innerText;
                        e.target.parentNode.parentNode.querySelector('input').focus();
                        isSelected = true;
                        setTimeout(()=>{
                            isSelected = false;
                        },100);
                    });
                });
            }
        });

        // Hits

        container.querySelector('input').addEventListener('keydown',(e)=>{
            const key = e.keyCode||e.which;
            if(key==13){
                this.search.searches.map((s)=>{
                    if(s.text===e.target.value){
                        e.target.setAttribute('hit-redirect',s.url);
                        s.hits+=1;
                        callback(s,this.sortSearchHits(this.search.searches));
                    }
                });
            }
        });

        if(this.search.button){
            container.querySelector('button').addEventListener('click',(e)=>{
                this.search.searches.map((s)=>{
                    if(s.text===e.target.parentNode.querySelector('input').value){
                        e.target.parentNode.querySelector('input').setAttribute('hit-redirect',s.url);
                        s.hits+=1;
                        callback(s,this.sortSearchHits(this.search.searches));
                    }
                });
            });
        }
        
    }
    /**
     * Returns a bar graph the top searches(in order)
     */
    searchGraph(){
        const chart = new chartJS('body');
        chart.add(this);   
        const xAxis = [], yAxis=[];
        for(let i=0;i<this.search.searches.length;i++){
            xAxis.push(`0,searches,${i},text`);
            yAxis.push(`0,searches,${i},hits`);
        }
        chart.bar(xAxis,yAxis,'x');
    }
}