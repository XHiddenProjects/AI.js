/**
 * @package AI.js
 * @class ChatbotAI
 * @description Creates and open-source for a chatbot
 * @version 1.0.0
 * @author XHiddenProjects
 * @license [MIT](https://github.com/XHiddenProjects/AI.js?tab=MIT-1-ov-file)
 */
class ChatbotAI{
    /**
     * Creates a chatbot training
     * @param {[{lang: String, utterance: String, intent: String}]} documents Training documents
     * @param {[{lang: String, intent: String, utterance: String}]} answers AI Responces
     * @param {{text: HTMLInputElement|HTMLTextAreaElement, submit:{key: Number,button: HTMLButtonElement}}} opt Options
     * @param {Function} callback function to return the function
     * @see [axa-group/nlp.js - Example of use](https://github.com/axa-group/nlp.js?tab=readme-ov-file#example-of-use)
     */
    constructor(documents, answers, opt, callback){
        if(!window.nlp) throw new ReferenceError('utils/nlp.js must be active');
        this.opt = opt;
        if(documents.length==0||answers==0) throw new RangeError('Documents and Answers must have 1 item each');

        this.docs = documents;
        this.ans = answers;
        let results;
        opt['text'].addEventListener('keydown',(e)=>{
            const k = e.keyCode||e.which||e.code;
            if(k===this.opt['submit']['key']){
                results = this.#submit(opt['text'].value);
                opt['text'].value = '';
                callback(results);
            }
        });
        if(opt['submit'].hasOwnProperty('btn')){
            opt['submit']['btn'].addEventListener('click',()=>{
                results = this.#submit(opt['text'].value);
                opt['text'].value = '';
                callback(results);
            });
        }
    }
    #submit(txt){
        txt = `"${txt}"`;
        const manager = new NLPManager(['en'],txt,{nlu:{useNoneFeature: false}});
        manager.normalize().tokenizer().sanitize();
        // Adds the utterances and intents for the NLP
        this.docs.forEach(t=>{
            manager.addDocument(t['lang'], t['utterance'], t['intent']);
        });
        // Train also the NLG
        this.ans.forEach(a=>{
            manager.addAnswer(a['lang'], a['intent'], a['utterance']);
        });
        manager.train();
        manager.save();
        const responce = manager.process('en',txt);
        return responce;
    }
}