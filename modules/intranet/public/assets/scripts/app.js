/** ANCHORFY BLOCK */
function convertToSlug(Text) {
    return Text.toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
}
function anchorfy(){

    var els = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    var currentPage = location.pathname
    els.forEach(function(el){
        var slug = convertToSlug(el.innerText)
        var path = currentPage + "#" + slug;
        el.setAttribute("id", slug);
        el.outerHTML = '<a href=' + path +'>' + el.outerHTML + '</a>'
    })
    var id = location.hash.substr(1);
    var element = document.getElementById(id);
    /* 
        * Method 1 Element.scrollIntoView
        * Docs: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
        *  Uncomment the line below to test it (make sure to comment out Method 2)
        */
        //element.scrollIntoView( {block: "top",behavior: "smooth"} );
    /* 
        * Method 2:  window.scrollTo with calculated offset
        * Docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
        * StackOverflow: https://stackoverflow.com/a/56391657
        * Notes: alternative method is to calculate the position that we want to scroll to - 
        * this might help fix the issue where the initial load has the title off canvas
        * due to the the menu being off canvas
        * Uncomment the lines below to test it (make sure to comment out Method 1)
    */
    if(element != null) {
        const yOffset = -20; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}

if (document.getElementById('dynamic-content-wrapper') != null) { // check if URL slug contains ID # and if the page contains the dynamic ID for the scroll to content
    window.addEventListener("load", anchorfy);
}
/** END OF ANCHORFY BLOCK */