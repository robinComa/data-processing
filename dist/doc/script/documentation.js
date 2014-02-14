(function(){

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
                $('#toc > li.active').removeClass('active');
                $('#toc > li:eq(' + index + ')').addClass('active');

                $(this).find('article').each(function(index){
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