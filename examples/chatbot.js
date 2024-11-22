window.addEventListener('load',()=>{
    const chatbot = new ChatbotAI([],[],{
        text: document.querySelector('input'),
        submit: {
            key: 13,
            btn: document.querySelector('button')
        }
    });
});