$("#window").click(function() {
    var mp3 = new Audio("music/bo.mp3");
    mp3.play();
    // console.log("11111");
    var sa = $(this).text();
    $(this).text("");
    $(this).addClass("ball");
    setTimeout(function() {
        $("#modal").fadeIn();
        $("#close").css("width", "30px");
        $("#close").css("height", "30px");
        setTimeout(function() {
            $("#window").removeClass("ball");
            $("#window").text(sa);
        }, 500);
    }, 150);
});

$("#close").click(function() {
    var mp3 = new Audio("music/bo.mp3");
    mp3.play();
    // console.log("11111");
    $("#modal").fadeOut();
    $("#close").css("width", "0px");
    $("#close").css("height", "0px");
});


$('.switch label').on('click', function() {
    var mp3 = new Audio("music/option.mp3");
    mp3.play();

    var indicator = $(this).parent('.switch').find('span');
    if ($(this).hasClass('middle')) {
        $(indicator).addClass('middle');
        $(indicator).removeClass('right');
    } else if($(this).hasClass('right')){
        $(indicator).addClass('right');
        $(indicator).removeClass('middle');
    } else {
        $(indicator).removeClass('right');
        $(indicator).removeClass('middle');
    }
});

$("#yes").click(function() {
    var mp3 = new Audio("music/bo.mp3");
    mp3.play();

    setTimeout(function() {
        // console.log("11111");
        $("#modal").toggle();
        $("#close").css("width", "0px");
        $("#close").css("height", "0px");
    }, 500);

});


