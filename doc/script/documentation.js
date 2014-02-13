(function(){

    $('#toc').affix();

    $('.code').each(function(el){
        var $el = $(this);
        $($el.attr('data-target')).text($el.text().replace('\n', ''));
    });

    hljs.configure({
        languages: ['javascript']
    });
    hljs.initHighlighting();

}());