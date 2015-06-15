FamousFramework.scene('famous-demos:clickable-hello', {
    behaviors: {
        'div' : {
            'text-content': '[[identity|myMessage]]'
        }
    },
    events: {
        '$self': {
            'click': function($state) {
                $state.set('myMessage', "Hello World!");
            }
        }
    },
    states: {
        myMessage: '',
    },
    tree: `<div></div>`
});