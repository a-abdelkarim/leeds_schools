$(document).ready(function(){
    let openSearchByLocationBtn = $("#openSearchByLocationBtn");
    let searchByLocationProceedBtn = $("#searchByLocationProceedBtn");
    let openSearchByKeywordBtn = $("#openSearchByKeywordBtn");
    let searchModeModal = $("#searchModeModal");
    let searchByLocationBackBtn = $("#searchByLocationBackBtn");
    let cancelSearchByLocationBtn = $("#cancelSearchByLocationBtn");



    openSearchByLocationBtn.click(function(){
        $('#searchByLocationModal').modal('show');
        $('.btn-toggle-menu').click();
    })

    searchByLocationProceedBtn.click(function(){
        // $('.btn-toggle-menu').click();
        isSearchByLocationMode = true;
        searchModeModal.modal("show");
    })

    openSearchByKeywordBtn.click(function(){
        $('#searchByKeywordModal').modal('show');
    })

    searchByLocationBackBtn.click(()=>{
        isSearchByLocationMode = false;
        $('.btn-toggle-menu').click();

    });

    cancelSearchByLocationBtn.click(()=>{
        isSearchByLocationMode = false;
        $('.btn-toggle-menu').click();
    })

    $('#searchModeModal').on('show.bs.modal', function (e) {
        $("#latLng").text('');
    });
})