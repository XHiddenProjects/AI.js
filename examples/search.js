window.addEventListener('load',()=>{

    const search = new searchAI({
        tag: 'searchAI',
        searches: [{
            search: 'How to build a modal?',
            redirect: '#'
        },
        {
            search: 'Where can I find a CMS?',
            redirect: '#'
        },
        {
            search: 'Can you help me?',
            redirect: '#'
        },
        {
            search: 'General',
            redirect: '#'
        },
        {
            search: 'Announcement',
            redirect: '#'
        },
        {
            search: 'general',
            redirect: '#'
        }],
        input: document.querySelector('.aiSearch'),
        button: document.querySelector('.submitSearch'),
        top: 5
    },'search','redirect');
    search.searchable((i,a)=>{
    
    });
});