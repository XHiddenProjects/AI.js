window.addEventListener('load',()=>{

    const documents = [{
        lang: 'en',
        utterance: 'goodbye for now',
        intent: 'greetings.bye'
    },
    {
        lang: 'en',
        utterance: 'bye bye take care',
        intent: 'greetings.bye'
    },
    {
        lang: 'en',
        utterance: 'okay see you later',
        intent: 'greetings.bye'
    },
    {
        lang: 'en',
        utterance: 'i must go',
        intent: 'greetings.bye'
    },
    {
        lang: 'en',
        utterance: 'hello',
        intent: 'greetings.hello'
    },
    {
        lang: 'en',
        utterance: 'hi',
        intent: 'greetings.hello'
    },
    {
        lang: 'en',
        utterance: 'howdy',
        intent: 'greetings.hello'
    }],
    answers = [{
        lang: 'en',
        intent: 'greetings.bye',
        utterance: 'Till next time'
    },
    {
        lang: 'en',
        intent: 'greetings.bye',
        utterance: 'see you soon!'
    },
    {
        lang: 'en',
        intent: 'greetings.hello',
        utterance: 'Hey there!'
    },
    {
        lang: 'en',
        intent: 'greetings.hello',
        utterance: 'Greetings!'
    }];

    const x = new ChatbotAI(documents,answers,{
        text: document.querySelector('input'),
        submit: {
            key: 13,
            btn: document.querySelector('button')
        }
    },results);

    function results(e){
        console.log(e);
    }
});