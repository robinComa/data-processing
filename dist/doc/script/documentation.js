(function(){

    /** Console.log extension */
    var orig = console.log;
    console.log = function() {
        var msgs = [];
        var text = [];
        var element = null;
        while(arguments.length) {
            var obj = [].shift.call(arguments);
            if(element === null){
                element = obj;
            }else{
                text.push(JSON.stringify(obj));
            }
            msgs.push(obj);
        }
        if($('section').find(element).size() === 1){
            $(element).append('>> ' + text.join(' ') + '\n');
        }
        orig.apply(console, msgs);
    };
    /** END OF Console.log extension */

    $('.code').each(function(el){
        var $el = $(this);
        $($el.attr('data-target')).text($el.text().replace('\n', ''));
    });

    hljs.configure({
        languages: ['javascript']
    });
    hljs.initHighlighting();

    /** TOC */
    $('#toc').affix();

    // Changing menu dependent on section
    $(window).scroll(function() {

        var windowTop = Math.max($('body').scrollTop(), $('html').scrollTop());

        $('section').each(function (index) {
            if (windowTop > ($(this).position().top)){
                $('#toc li.active').removeClass('active');
                $('#toc > li:eq(' + index + ')').addClass('active');

                $('article').each(function(index){
                    if (windowTop > ($(this).position().top)){
                        $('#toc > li > ul > li.active').removeClass('active');
                        $('#toc > li > ul > li:eq(' + index + ')').addClass('active');
                    }
                });
            }
        });

    }).scroll();
    /** END OF TOC */

}());