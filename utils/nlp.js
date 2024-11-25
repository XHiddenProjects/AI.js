/**
 * Creates a NLP manager
 */
class NLPManager{
    #stopwords;
    /**
     * Creates an NLP manager
     * @param {String[]} languages Dictionary language
     * @param {String} txt String to check
     * @param {JSON} [options={}] Options for each method
     * @returns {NLPManager} 
     */
    constructor(languages,txt,options={}){

        this.#stopwords = {};
        this.lang = '';
        this.selectedLang = '';
        
        NLPManager.prototype.txt = txt;
    
        if(!window.Tokenizr) throw new ReferenceError('utils/tokenizr.min.js must be active');
        if(!window.text) throw new ReferenceError('utils/text.js must be active');

        if(!options.hasOwnProperty('normalize'))
            options['normalize'] = 'nfc';
        if(!options.hasOwnProperty('tokenizer'))
            options['tokenizer'] = {
                patterns: [
                    /[+-]?[0-9]+/,
                    /"((?:\\"|[^\r\n])*)"/,
                    /\/\/[^\r\n]*\r?\n/,
                    /[ \t\r\n]+/,
                    /./
                ],
                callback: [
                    (ctx, match) => {
                        ctx.accept("number", parseInt(match[0]))
                    },
                    (ctx, match) => {
                        ctx.accept("string", match[1].replace(/\\"/g, "\""))
                    },
                    (ctx, match) => {
                        ctx.ignore()
                    },
                    (ctx, match) => {
                        ctx.ignore()
                    },
                    (ctx, match) => {
                        ctx.accept("char")
                    }
                ]
            };
        if(!options.hasOwnProperty('nlu')){
            options['nlu'] = {
                useNoneFeature: true
            };
        }else{
            if(!options.nlu.hasOwnProperty('useNoneFeature')) options.nlu.useNoneFeature = true;
        }
        
        NLPManager.prototype.opt = options;
        NLPManager.prototype.nlp = {};
        NLPManager.prototype.results = {saved: 0, output: []};
        let sw = [];
        languages.forEach(l=>{
            this.#setLang(l).#init();
            // UPDATE STOPWORDS
            if(options.hasOwnProperty('stopwords')){
                options['stopwords'].forEach((e,i)=>{
                    if(typeof e==='function')
                        e(this);
                    else
                        throw new TypeError(`Index ${i}: Must be a function`);
                });
            }
            // CLOSE STOPWORDS

            sw = this.#setLang(l).listStopwords();
            NLPManager.prototype.nlp[l] = {stopwords: sw, documents: [], answers: []};
        });

        NLPManager.prototype.tokens = [];
        return NLPManager.prototype;
    }


    #init(){
        const xhr = new XMLHttpRequest();
        xhr.onload = ()=>{
            if(xhr.status==200&&xhr.readyState==4){
                this.#stopwords[this.lang] = xhr.responseText.split(/\r\n|\n/g);
            }
        }
        xhr.open('GET',`./stopwords/${this.lang}.txt`,false);
        xhr.send();
    }

    #setLang(lang){
        this.lang = lang;
        if(!this.#stopwords.hasOwnProperty(lang)) this.#stopwords[lang] = [];
        return this;
    }
    /**
     * Add stopword to dictionary
     * @param  {...String} items 
     */
    addStopwords(...items){ 
        items.forEach(i=>{
            this.#stopwords[this.lang].push(i);
        });
    }
    /**
     * Remove stopwords from list
     * @param  {...String} items Words to remove
     */
    removeStopwords(...items){
        items.forEach(i=>{
            this.#stopwords[this.lang] = this.#stopwords[this.lang].filter(e=>e.toLocaleLowerCase()!==i.toLocaleLowerCase());
        });
    }

    /**
     * Lists the stopwords
     * @returns {String[]}
     */
    listStopwords(){
        return this.#stopwords[this.lang];
    }



    /**
     * Normalizes the string
     * @return {NLPManager}
     */
    normalize(){
        this.txt = this.txt.normalize(this.opt.normalize.toLocaleUpperCase());
        return NLPManager.prototype;
    }
    /**
     * Normalizes the string
     * @return {String}
     */
    normalize2(txt){
        return txt.normalize(this.opt.normalize.toLocaleUpperCase());
    }

    /**
     * Tokenizes the string
     * @api https://github.com/rse/tokenizr
     * @returns {NLPManager}
     */
    tokenizer(){
        const setTokens = [], 
        tokens = [],
        patterns = this.opt.tokenizer.patterns,
        callback = this.opt.tokenizer.callback;
        if(!window.Tokenizr) throw new ReferenceError("utils/tokenizr.min.js has not been loaded");
        const lexer = new window.Tokenizr();
        if(patterns.length==0||callback.length==0) throw new Error('You must have 1+ items');
        if(patterns.length!==callback.length)
            throw new RangeError('All 3 parameters must be the same amount of length');
        for(let i=0;i<patterns.length;i++)
            lexer.rule(patterns[i],callback[i]);
        lexer.input(this.txt);
        lexer.debug(false);
        lexer.tokens().forEach((token) => {
            setTokens.push(token.toJSON());
        });

        setTokens.forEach(e=>{
            e.value = e.value.replace(/^"|"$/g,'');
            if(e.value!=="\"\""){
                e.value.trim().split(' ').forEach(t=>{
                    tokens.push(t);
                })
                
            }
        });
        this.tokens = tokens.filter((e)=>e!=='').map(i=>{
            return i.replace(/[.?!;,()\[\]:]/g,'');
        });
        return NLPManager.prototype;
    }
    /**
     * Tokenizes the string
     * @api https://github.com/rse/tokenizr
     * @returns {Array} Tokenized string
     */
    tokenizer2(tkns){
        tkns = `"${tkns}"`;
        const setTokens = [], 
        tokens = [],
        patterns = this.opt.tokenizer.patterns,
        callback = this.opt.tokenizer.callback;
        if(!window.Tokenizr) throw new ReferenceError("utils/tokenizr.min.js has not been loaded");
        const lexer = new window.Tokenizr();
        if(patterns.length==0||callback.length==0) throw new Error('You must have 1+ items');
        if(patterns.length!==callback.length)
            throw new RangeError('All 3 parameters must be the same amount of length');
        for(let i=0;i<patterns.length;i++)
            lexer.rule(patterns[i],callback[i]);
        lexer.input(tkns);
        lexer.debug(false);
        lexer.tokens().forEach((token) => {
            setTokens.push(token.toJSON());
        });

        setTokens.forEach(e=>{
            e.value = e.value.replace(/^"|"$/g,'');
            if(e.value!=="\"\""){
                e.value.trim().split(' ').forEach(t=>{
                    tokens.push(t);
                })
                
            }
        });
        const finalize = tokens.filter((e)=>e!=='').map(i=>{
            return i.replace(/[.?!;,()\[\]:]/g,'');
        });
        return finalize;
    }
    /**
     * Sanitizes the tokens
     * @returns {NLPManager}
     */
    sanitize(){
        Object.keys(this.nlp).forEach(e=>{
        const v = this.nlp[e];
        this.tokens = this.tokens.filter(t=>{
                if(t!=='')
                    return v['stopwords'].indexOf(t.toLowerCase()) == -1;
            });
        });
        return NLPManager.prototype;
    }
    /**
     * Sanitizes string
     * @param {Array} keys Sanitizes the array
     * @returns {Array}
     */
    sanitize2(keys){
        Object.keys(this.nlp).forEach(e=>{
        const v = this.nlp[e];
        keys = keys.filter(t=>{
                if(t!=='')
                    return v['stopwords'].indexOf(t.toLowerCase()) == -1;
            });
        });
        return keys;
    }

    /**
     * Add a document to the AI
     * @param {String} lang Language dictionary to target
     * @param {String} utterance Message to look for
     * @param {String} intent modal to look for.
     * @returns {NLPManager}
     */
    addDocument(lang, utterance, intent){
        this.nlp[lang]['documents'].push({'utterance':utterance, 'intent': intent});
        return NLPManager.prototype;
    }
    /**
     * Add answers to the AI
     * @param {String} lang Language dictionary to target
     * @param {String} intent modal to look for
     * @param {String} utterance Message to return
     */
    addAnswer(lang,intent,utterance){
        this.nlp[lang]['answers'].push({'utterance':utterance, 'intent': intent});
        return NLPManager.prototype;
    }

    train(){
        const txt = new text();
        const classification = [],classID=[{intent:'None',value: 0}];
        Object.keys(this.nlp).forEach(l=>{
            //txt.measure(this.txt.replace(/^\"|$\"/g,'')
            this.nlp[l]['documents'].forEach(i=>{
                const t = this.tokens.sort((a,b)=>a.localeCompare(b)),
                s = this.sanitize2(this.tokenizer2(this.normalize2(i['utterance']))).sort((a,b)=>a.localeCompare(b)),
                m = txt.similarText(t,s);
                classID.push({intent:i['intent'], value: m, utterance: i['utterance']});
            });
        });
        const setTraining = classID.sort((a,b)=>b.value-a.value);
        let None=0;
        setTraining.forEach(i=>{
            if(!classification.some(l=>l.label===i.intent)){
                classification.push({label: i.intent, value: i.value});
            }else{
                if(classification.some(l=>(l.label===i.intent&&l.value!==0))){
                    None++;
                    if(!classification.some(l=>l.label==='None'))
                        classification.push({label: 'None', value: None})
                    else{
                        classification.map(k=>{
                            if(k.label==='None') k.value = None;
                        });
                    }
                    
                }
            }
        });
        None=0;
        classification.forEach(k=>{
            if(k!=='None'){
                classID.forEach(i=>{
                    if(i.intent!=='None'){
                        if(i.intent===k.label){
                            if(classification.some(l=>l.label===i.intent&&l.value!=0)){
                                if(i.value>0){
                                    k.value*=i.value;
                                }else
                                    None+=1;
                            }
                        }
                    }
                });
            }
        });
        let removeExtras=0;
        classification.forEach(k=>{
            if(k.value>0&&k.label!=='None')
                removeExtras=k.value;
        });
        classification.forEach(k=>{
            if(k.label==='None')
                k.value*=(None*Math.pow(removeExtras,2));
        });

        if(!this.opt.nlu.useNoneFeature){
            const indexToDelete = classification.findIndex((element) => element.label === 'None');
            if (indexToDelete !== -1) {
                classification.splice(indexToDelete, 1);
            }
        }

        const answersMatched = [], sentiment={}, entities=[];
        Object.keys(this.nlp).forEach(l=>{
            this.nlp[l]['answers'].forEach(a=>{
                if(a.intent===classification.sort((a,b)=>b.value-a.value)[0].label){
                    const f = classID.filter(i=>(i.intent===a.intent));
                    f.forEach(e => {
                        const m1 = txt.similarText(this.tokens,this.sanitize2(this.tokenizer2(this.normalize2(e.utterance))));
                        if(m1!=0){
                            const m2 = txt.similarText(this.sanitize2(this.tokenizer2(this.normalize2(e.utterance))),this.sanitize2(this.tokenizer2(this.normalize2(a.utterance))));
                            if(!answersMatched.some(k=>k.answer.match(a.utterance))){
                                answersMatched.push({document: e.utterance, answer: a.utterance, value: m2});
                            }
                        }
                    });
                }
            });
        });

        this.tokens = this.tokens.sort((a,b)=>b-a);
        answersMatched.forEach(i=>{
            const s = i.document.split(' ').sort((a,b)=>b-a);
            if(s.length>this.tokens.length) this.tokens.unshift('');
            for(let k=0;k<s.length;k++){
                if(this.tokens[k]){
                    if(this.tokens[k].match(new RegExp(`${s[k]}`,'i')))
                        (sentiment['numHits'] ? sentiment['numHits']+=1 : sentiment['numHits'] = 1);
                }
            }
            sentiment['numWords'] = s.length;
        });
        console.log()
        sentiment['score'] = (sentiment['numHits'] / sentiment['numWords']);
        sentiment['comparative'] = (sentiment['score']/sentiment['numWords']);
        sentiment['vote'] = (sentiment['comparative']>0 ? 'positive' : (sentiment['comparative']<0 ? 'negitive' : 'neutral'))
        sentiment['type'] = 'senticon';


        answersMatched.forEach(i=>{
            this.tokens.forEach(t=>{
                const res = txt.setNER(i['document'],t);
                if(res&&!entities.some(k=>(k.sourceText!==res[res.length-1].searched))){
                    entities.push({'start':res[res.length-1].start,
                    'end': res[res.length-1].end,
                    'len': res[res.length-1].len,
                    'accuracy': 0,
                    'sourceText':  res[res.length-1].searched,
                    'utteranceText': res[res.length-1].searched,
                    'entity': res[res.length-1].predictedEntites.join(''),
                    'resolution': [new Object()]});
                }
            });
        });
        const uniqueData = (arr) => {
            const seen = new Set();
            return arr.filter(item => {
                const identifier = `${item.start}-${item.end}-${item.len}-${item.accuracy}-${item.sourceText}-${item.utteranceText}-${item.entity}`;
                if (seen.has(identifier)) {
                    return false; // Duplicate item
                }
                seen.add(identifier);
                return true; // Unique item
            });
        };
        this.results['output'] = {
            classification: classification.sort((a,b)=>b.value-a.value),
            intent: classification.sort((a,b)=>b.value-a.value)[0].label,
            score: classification.sort((a,b)=>b.value-a.value)[0].value,
            entities: uniqueData(entities),
            sentiment: sentiment,
            actions:[],
            srcAnswer: (answersMatched.length>0 ? answersMatched.sort((a,b)=>b.value-a.value)[0].answer : ''),
            answer: (answersMatched.length>0 ? answersMatched.sort((a,b)=>b.value-a.value)[0].answer : '')
        };
    
        return NLPManager.prototype;
    }
    /**
     * Save the results
     * @returns {NLPManager}
     */
    save(){
        this.results['saved'] = 1;
        return NLPManager.prototype;
    }

    process(lang,utterance){
        if(this.results['saved']&&Object.keys(this.results['output']).length>0){
            utterance = utterance.replace(/^\"|\"$/g,'');
            const nlp = this.nlp[lang],
            tokens = this.tokens,
            iso = `${lang}-${navigator.languages[0].substring(3)}`;
            this.results['output']['sentiment']['language'] = (new Intl.Locale(iso)).language.substring(0,2);
            return {
                utterance: utterance,
                locale: iso.substring(0,2),
                languageGuessed: false,
                localeIso2: (new Intl.Locale(iso)).language.substring(0,2),
                language: (new Intl.DisplayNames([lang],{type: 'language'})).of(lang),
                domain: 'default',
                classification: this.results['output']['classification'],
                intent: this.results['output']['intent'],
                score: this.results['output']['score'],
                entities: this.results['output']['entities'],
                sentiment: this.results['output']['sentiment'],
                actions: this.results['output']['actions'],
                srcAnswer: this.results['output']['srcAnswer'],
                answer: this.results['output']['answer']
            }
        }else
            return {error: 1, message: 'Training has not been made'};

    }

}
window.nlp = NLPManager;