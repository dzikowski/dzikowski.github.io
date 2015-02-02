jQuery(document).ready(function($){
    // todo: jquery stuff should need to put here.
    console.log('document ready!');
        
    // all external links in new tab; thx to: http://stackoverflow.com/questions/4425198/markdown-target-blank
    $(document.links).filter(function() {
        return this.hostname != window.location.hostname;
    }).attr('target', '_blank');
    
    // generate side menu for post content
    $('.post').scrollNav({
        sections: 'h2',
        subSections: false, // does not work?
        sectionElem: 'section',
        showHeadline: false,
        headlineText: $('.post h1').html(),
        showTopLink: true,
        topLinkText: 'Początek artykułu',
        fixedMargin: 40,
        scrollOffset: 100,
        animated: true,
        speed: 500,
        insertTarget: $('#navbar'),
        insertLocation: 'appendTo',
        arrowKeys: false,
        onInit: function() { $('#navbar').html(''); },
        onRender: null,
        onDestroy: null
    });
    
    // http://stackoverflow.com/questions/2286857/replace-character-space-with-nbsp-across-whole-webpage-using-javascript-jque
    function replaceText(node) {
      var current = node.nodeValue;
      var replaced = current.replace(/(\s)(\S)\s+/g,"$1$2\xA0");
      node.nodeValue = replaced;
    }
    function traverse(node) {
      var children = node.childNodes;
      var childLen = children.length;
      for(var i = 0; i < childLen; i++)
      {
        var child = children.item(i);
        if(child.nodeType == 3)//or if(child instanceof Text)
          replaceText(child);
        else if (child.nodeName !== "PRE") // banned tags
          traverse(child);
      }
    }
    
    // replace all
    traverse(document.body);

    
});
