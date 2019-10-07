export default function SUOtherShortcodes () {
  jQuery(document).ready(function ($) {
  // Spoiler
    $('body:not(.su-other-shortcodes-loaded)').on(
      'click keypress',
      '.su-spoiler-title',
      function (e) {
        var $title = $(this)
        var $spoiler = $title.parent()
        var bar = $('#wpadminbar').length > 0 ? 28 : 0
        // Open/close spoiler
        $spoiler.toggleClass('su-spoiler-closed')
        // Close other spoilers in accordion
        $spoiler
          .parent('.su-accordion')
          .children('.su-spoiler')
          .not($spoiler)
          .addClass('su-spoiler-closed')
        // Scroll in spoiler in accordion
        if ($(window).scrollTop() > $title.offset().top) { $(window).scrollTop($title.offset().top - $title.height() - bar) }
        e.preventDefault()
      }
    )
    // Tabs
    $('body:not(.su-other-shortcodes-loaded)').on(
      'click keypress',
      '.su-tabs-nav span',
      function (e) {
        var $tab = $(this)
        var data = $tab.data()
        var index = $tab.index()
        var is_disabled = $tab.hasClass('su-tabs-disabled')
        var $tabs = $tab.parent('.su-tabs-nav').children('span')
        var $panes = $tab.parents('.su-tabs').find('.su-tabs-pane')
        var $gmaps = $panes.eq(index).find('.su-gmap:not(.su-gmap-reloaded)')
        // Check tab is not disabled
        if (is_disabled) return false
        // Hide all panes, show selected pane
        $panes
          .removeClass('su-tabs-pane-open')
          .eq(index)
          .addClass('su-tabs-pane-open')
        // Disable all tabs, enable selected tab
        $tabs
          .removeClass('su-tabs-current')
          .eq(index)
          .addClass('su-tabs-current')
        // Reload gmaps
        if ($gmaps.length > 0) {
          $gmaps.each(function () {
            var $iframe = $(this).find('iframe:first')
            $(this).addClass('su-gmap-reloaded')
            $iframe.attr('src', $iframe.attr('src'))
          })
        }
        // Open specified url
        if (data.url !== '') {
          if (data.target === 'self') window.location = data.url
          else if (data.target === 'blank') window.open(data.url)
        }
        e.preventDefault()
      }
    )

    // Activate tabs
    $('.su-tabs').each(function () {
      var active = parseInt($(this).data('active')) - 1
      $(this)
        .children('.su-tabs-nav')
        .children('span')
        .eq(active)
        .trigger('click')
    })

    // Activate anchor nav for tabs and spoilers
    anchor_nav()

    // Lightbox
    $(document).on('click', '.su-lightbox', function (e) {
      e.preventDefault()
      e.stopPropagation()

      if (
        $(this)
          .parent()
          .attr('id') === 'su-generator-preview'
      ) {
        $(this).html(SUShortcodesL10n.noPreview)

        return
      }

      var type = $(this).data('mfp-type')
      var mobile = $(this).data('mobile')
      var windowWidth = $(window).width()

      $(this)
        .magnificPopup({
          disableOn: function () {
            if (mobile === 'no' && windowWidth < 768) {
              return false
            }
            if (typeof mobile === 'number' && windowWidth < mobile) {
              return false
            }
            return true
          },
          type: type,
          tClose: SUShortcodesL10n.magnificPopup.close,
          tLoading: SUShortcodesL10n.magnificPopup.loading,
          gallery: {
            tPrev: SUShortcodesL10n.magnificPopup.prev,
            tNext: SUShortcodesL10n.magnificPopup.next,
            tCounter: SUShortcodesL10n.magnificPopup.counter
          },
          image: {
            tError: SUShortcodesL10n.magnificPopup.error
          },
          ajax: {
            tError: SUShortcodesL10n.magnificPopup.error
          }
        })
        .magnificPopup('open')
    })
    // Frame
    $('.su-frame-align-center, .su-frame-align-none').each(function () {
      var frame_width = $(this)
        .find('img')
        .width()
      $(this).css('width', frame_width + 12)
    })
    // Tooltip
    $('.su-tooltip').each(function () {
      var $tt = $(this)
      var $content = $tt.find('.su-tooltip-content')
      var is_advanced = $content.length > 0
      var data = $tt.data()
      var config = {
        style: {
          classes: data.classes
        },
        position: {
          my: data.my,
          at: data.at,
          viewport: $(window)
        },
        content: {
          title: '',
          text: ''
        }
      }
      if (data.title !== '') config.content.title = data.title
      if (is_advanced) config.content.text = $content
      else config.content.text = $tt.attr('title')
      if (data.close === 'yes') config.content.button = true
      if (data.behavior === 'click') {
        config.show = 'click'
        config.hide = 'click'
        $tt.on('click', function (e) {
          e.preventDefault()
          e.stopPropagation()
        })
        $(window).on('scroll resize', function () {
          $tt.qtip('reposition')
        })
      } else if (data.behavior === 'always') {
        config.show = true
        config.hide = false
        $(window).on('scroll resize', function () {
          $tt.qtip('reposition')
        })
      } else if (data.behavior === 'hover' && is_advanced) {
        config.hide = {
          fixed: true,
          delay: 600
        }
      }
      $tt.qtip(config)
    })

    // Expand
    $('body:not(.su-other-shortcodes-loaded)').on(
      'click',
      '.su-expand-link',
      function () {
        var $this = $(this)
        var $container = $this.parents('.su-expand')
        var $content = $container.children('.su-expand-content')

        if ($container.hasClass('su-expand-collapsed')) {
          $content.css('max-height', 'none')
        } else {
          $content.css('max-height', $container.data('height') + 'px')
        }

        $container.toggleClass('su-expand-collapsed')
      }
    )

    function is_transition_supported () {
      var thisBody = document.body || document.documentElement
      var thisStyle = thisBody.style
      var support =
        thisStyle.transition !== undefined ||
        thisStyle.WebkitTransition !== undefined ||
        thisStyle.MozTransition !== undefined ||
        thisStyle.MsTransition !== undefined ||
        thisStyle.OTransition !== undefined

      return support
    }

    // Animations is supported
    if (is_transition_supported()) {
    // Animate
      $('.su-animate').each(function () {
        $(this).one('inview', function (e) {
          var $this = $(this)
          var data = $this.data()
          window.setTimeout(function () {
            $this.addClass(data.animation)
            $this.addClass('animated')
            $this.css('visibility', 'visible')
          }, data.delay * 1000)
        })
      })
    }
    // Animations isn't supported
    else {
      $('.su-animate').css('visibility', 'visible')
    }

    function anchor_nav () {
    // Check hash
      if (document.location.hash === '') return
      // Go through tabs
      $('.su-tabs-nav span[data-anchor]').each(function () {
        if ('#' + $(this).data('anchor') === document.location.hash) {
          var $tabs = $(this).parents('.su-tabs')
          var bar = $('#wpadminbar').length > 0 ? 28 : 0
          // Activate tab
          $(this).trigger('click')
          // Scroll-in tabs container
          window.setTimeout(function () {
            $(window).scrollTop($tabs.offset().top - bar - 10)
          }, 100)
        }
      })
      // Go through spoilers
      $('.su-spoiler[data-anchor]').each(function () {
        if ('#' + $(this).data('anchor') === document.location.hash) {
          var $spoiler = $(this)
          var bar = $('#wpadminbar').length > 0 ? 28 : 0
          // Activate tab
          if ($spoiler.hasClass('su-spoiler-closed')) { $spoiler.find('.su-spoiler-title:first').trigger('click') }
          // Scroll-in tabs container
          window.setTimeout(function () {
            $(window).scrollTop($spoiler.offset().top - bar - 10)
          }, 100)
        }
      })
    }

    if ('onhashchange' in window) $(window).on('hashchange', anchor_nav)

    $('body').addClass('su-other-shortcodes-loaded')
  })
}
