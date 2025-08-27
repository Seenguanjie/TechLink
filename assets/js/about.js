$(window).on('scroll', function() {
  $('.mb-5, .mt-5, .col-md-6').each(function() {
    var elementTop = $(this).offset().top;
    var viewportBottom = $(window).scrollTop() + $(window).height();

    if (elementTop < viewportBottom) {
      $(this).addClass('show');
    } else {
      $(this).removeClass('show');
    }
  });
});
