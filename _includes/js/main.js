jQuery(document).ready(function($){
    // todo: jquery stuff should need to put here.
    
    // all external links in new tab; thx to: http://stackoverflow.com/questions/4425198/markdown-target-blank
    $(document.links).filter(function() {
        return this.hostname != window.location.hostname;
    }).attr('target', '_blank');
});
