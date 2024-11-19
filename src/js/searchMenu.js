$(document).ready(function(){
    const menuElements = {
        // content Elements
        searchByAllContentElem: $("#searchByAllContent"),
        searchByLocationContentElem: $("#searchByLocationContent"),
        searchByFilterContentElem: $("#searchByFilterContentElem"),
        // Radio Element
        searchRadioElem: (""),
    }


    function handleSearchMethod() {
        // Get all radio buttons with the name "searchMethod"
        var radioButtons = document.getElementsByName('searchMethod');

        // Loop through each radio button
        for (var i = 0; i < radioButtons.length; i++) {
            // Attach an event listener to each radio button
            radioButtons[i].addEventListener('change', function(event) {
                // Inside this function, "this" refers to the radio button that triggered the event
                var checkedValue = this.value; // Get the value of the checked radio button
                if (checkedValue === "all") {
                    enableContentElem(menuElements.searchByAllContentElem)
                    disableContentElem(menuElements.searchByFilterContentElem);
                    disableContentElem(menuElements.searchByLocationContentElem);
                    menuElements.searchByLocationContentElem.hide();
                    menuElements.searchByAllContentElem.show();
                } else if (checkedValue === "location") {
                    enableContentElem(menuElements.searchByLocationContentElem)
                    disableContentElem(menuElements.searchByAllContentElem);
                    disableContentElem(menuElements.searchByFilterContentElem);
                    menuElements.searchByLocationContentElem.show();
                    menuElements.searchByAllContentElem.hide();
                } else if (checkedValue ==="filter") {
                    enableContentElem(menuElements.searchByFilterContentElem);
                    disableContentElem(menuElements.searchByLocationContentElem);
                    disableContentElem(menuElements.searchByAllContentElem);
                    menuElements.searchByLocationContentElem.hide();
                    menuElements.searchByAllContentElem.hide();
                }
            });
        }
    }

    function disableContentElem(elem){
        elem.find('*').prop('disabled', true);
    }

    function enableContentElem(elem) {
        elem.find('*').prop('disabled', false);
    }

    handleSearchMethod();

    $('#searchAll').on('click', function(){
        $(this).parent().find('a').trigger('click')
      })
      
      $('#searchLocation').on('click', function(){
        $(this).parent().find('a').trigger('click')
      })

      $('#searchFilter').on('click', function(){
        $(this).parent().find('a').trigger('click')
      })
})