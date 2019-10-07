/* global jQuery, wp, ajaxurl, SUGL10n */

window.SUG = {}

window.SUG.App = (($) => {
  var $generator = $('#su-generator')
  var $search = $('#su-generator-search')
  var $filter = $('#su-generator-filter')
  var $filters = $filter.children('a')
  var $choices = $('#su-generator-choices')
  var $choice = $choices.find('span')
  var $settings = $('#su-generator-settings')
  var $prefix = $('#su-compatibility-mode-prefix')
  var $result = $('#su-generator-result')
  var $selected = $('#su-generator-selected')

  var self = {}

  self.state = {
    mceSelection: '',
    target: '',
    wpActiveEditor: null,
    context: '',
    insertArgs: '',
    preview: {
      timer: null,
      request: null
    }
  }

  self.el = {
    body: $('body')
  }

  self.init = () => {
    $filters.click(
      function (e) {
        // Prepare data
        var filter = $(this).data('filter')
        // If filter All, show all choices
        if (filter === 'all') {
          $choice.css(
            {
              opacity: 1
            }
          ).removeClass('su-generator-choice-first')
        } else { // Else run search
          var regex = new RegExp(filter, 'gi')
          // Hide all choices
          $choice.css({ opacity: 0.2 })
          // Find searched choices and show
          $choice.each(
            function () {
              // Get shortcode name
              var group = $(this).data('group')
              // Show choice if matched
              if (group.match(regex) !== null) {
                $(this)
                  .css({ opacity: 1 })
                  .removeClass('su-generator-choice-first')
              }
            }
          )
        }
        e.preventDefault()
      }
    )
    // Go to home link
    $('#su-generator').on(
      'click',
      '.su-generator-home',
      function (e) {
        // Clear search field
        $search.val('')
        // Hide settings
        $settings.html('').hide()
        // Remove narrow class
        $generator.removeClass('su-generator-narrow')
        // Show filters
        $filter.show()
        // Show choices panel
        $choices.show()
        $choice.show()
        // Clear selection
        self.state.mceSelection = ''
        // Focus search field
        $search.focus()
        e.preventDefault()
      }
    )
    // Generator close button
    $('#su-generator').on(
      'click',
      '.su-generator-close',
      function (e) {
        // Close popup
        $.magnificPopup.close()
        // Prevent default action
        e.preventDefault()
      }
    )
    // Search field
    $search.on(
      {
        focus: function () {
          // Clear field
          $(this).val('')
          // Hide settings
          $settings.html('').hide()
          // Remove narrow class
          $generator.removeClass('su-generator-narrow')
          // Show choices panel
          $choices.show()
          $choice.css(
            {
              opacity: 1
            }
          ).removeClass('su-generator-choice-first')
          // Show filters
          $filter.show()
        },
        blur: function () {},
        keyup: function (e) {
          // Prepare vars
          var $first = $('.su-generator-choice-first:first')
          var val = $(this).val()
          var regex = new RegExp(val, 'gi')
          var best = 0
          // Hotkey action
          if (e.keyCode === 13 && $first.length > 0) {
            e.preventDefault()
            $(this).val('').blur()
            $first.trigger('click')
          }
          // Hide all choices
          $choice.css(
            {
              opacity: 0.2
            }
          ).removeClass('su-generator-choice-first')
          // Loop and highlight choices
          $choice.each(
            function () {
              // Get choice data
              var data = $(this).data()
              var id = data.shortcode
              var name = data.name
              var desc = data.desc
              var group = data.group
              var matches = ([id, name, desc, group].join(' ')).match(regex)
              // Highlight choice if matched
              if (matches !== null) {
                // Highlight current choice
                $(this).css(
                  {
                    opacity: 1
                  }
                )
                // Check for exact match
                if (val === id) {
                  // Remove primary class from all choices
                  $choice.removeClass('su-generator-choice-first')
                  // Add primary class to the current choice
                  $(this).addClass('su-generator-choice-first')
                  // Prevent selecting by matches number
                  best = 999
                } else if (matches.length > best) { // Check matches length
                  // Remove primary class from all choices
                  $choice.removeClass('su-generator-choice-first')
                  // Add primary class to the current choice
                  $(this).addClass('su-generator-choice-first')
                  // Save the score
                  best = matches.length
                }
              }
            }
          )
          // Remove primary class if search field is empty
          if (val === '') {
            $choice.removeClass('su-generator-choice-first')
          }
        }
      }
    )
    // Click on shortcode choice
    $choice.on(
      'click',
      function (e) {
        // Prepare data
        var shortcode = $(this).data('shortcode')
        // Load shortcode options
        $.ajax(
          {
            type: 'POST',
            url: ajaxurl,
            data: {
              action: 'su_generator_settings',
              shortcode: shortcode
            },
            beforeSend: function () {
              // Hide preview box
              $('#su-generator-preview').hide()
              // Hide choices panel
              $choices.hide()
              // Show loading animation
              $settings.addClass('su-generator-loading').show()
              // Add narrow class
              $generator.addClass('su-generator-narrow')
              // Hide filters
              $filter.hide()
            },
            success: function (data) {
              // Hide loading animation
              $settings.removeClass('su-generator-loading')
              // Insert new HTML
              $settings.html(data)
              // Apply selected text to the content field
              var $content = $('#su-generator-content')
              if (typeof self.state.mceSelection !== 'undefined' && self.state.mceSelection !== '' && $content.attr('type') !== 'hidden') {
                $content.val(self.state.mceSelection)
              }
              // Init range pickers
              $('.su-generator-range-picker').each(
                function (index) {
                  var $picker = $(this)
                  var $val = $picker.find('input')
                  var min = $val.attr('min')
                  var max = $val.attr('max')
                  var step = $val.attr('step')
                  // Apply noUIslider
                  $val.simpleSlider(
                    {
                      snap: true,
                      step: step,
                      range: [min, max]
                    }
                  )
                  $val.show()
                  $val.on(
                    'keyup blur',
                    function (e) {
                      $val.simpleSlider('setValue', $val.val())
                    }
                  )
                }
              )
              // Init color pickers
              $('.su-generator-select-color').each(
                function (index) {
                  $(this).find('.su-generator-select-color-wheel').filter(':first').farbtastic('.su-generator-select-color-value:eq(' + index + ')')
                  $(this).find('.su-generator-select-color-value').focus(
                    function () {
                      $('.su-generator-select-color-wheel:eq(' + index + ')').show()
                    }
                  )
                  $(this).find('.su-generator-select-color-value').blur(
                    function () {
                      $('.su-generator-select-color-wheel:eq(' + index + ')').hide()
                    }
                  )
                }
              )
              // Init image sourse pickers
              $('.su-generator-isp').each(
                function () {
                  var $picker = $(this)
                  var $sources = $picker.find('.su-generator-isp-sources')
                  var $source = $picker.find('.su-generator-isp-source')
                  var $addMedia = $picker.find('.su-generator-isp-add-media')
                  var $images = $picker.find('.su-generator-isp-images')
                  var $cats = $picker.find('.su-generator-isp-categories')
                  var $taxes = $picker.find('.su-generator-isp-taxonomies')
                  var $terms = $('.su-generator-isp-terms')
                  var $val = $picker.find('.su-generator-attr')
                  var frame
                  // Update hidden value
                  var update = function () {
                    var val = 'none'
                    var ids = ''
                    var source = $sources.val()
                    // Media library
                    if (source === 'media') {
                      var images = []
                      $images.find('span').each(
                        function (i) {
                          images[i] = $(this).data('id')
                        }
                      )
                      if (images.length > 0) {
                        ids = images.join(',')
                      }
                    }
                    // Category
                    else if (source === 'category') {
                      var categories = $cats.val() || []
                      if (categories.length > 0) {
                        ids = categories.join(',')
                      }
                    }
                    // Taxonomy
                    else if (source === 'taxonomy') {
                      var tax = $taxes.val() || ''
                      var terms = $terms.val() || []
                      if (tax !== '0' && terms.length > 0) {
                        val = 'taxonomy: ' + tax + '/' + terms.join(',')
                      }
                    }
                    // Deselect
                    else if (source === '0') {
                      val = 'none'
                    }
                    // Other options
                    else {
                      val = source
                    }
                    if (ids !== '') {
                      val = source + ': ' + ids
                    }
                    $val.val(val).trigger('change')
                  }
                  // Switch source
                  $sources.on(
                    'change',
                    function (e) {
                      var source = $(this).val()
                      e.preventDefault()
                      $source.removeClass('su-generator-isp-source-open')
                      if (source.indexOf(':') === -1) {
                        $picker.find('.su-generator-isp-source-' + source).addClass('su-generator-isp-source-open')
                      }
                      update()
                    }
                  )
                  // Remove image
                  $images.on(
                    'click',
                    'span i',
                    function () {
                      $(this).parent('span').css('border-color', '#f03').fadeOut(
                        300,
                        function () {
                          $(this).remove()
                          update()
                        }
                      )
                    }
                  )
                  // Add image
                  $addMedia.click(
                    function (e) {
                      e.preventDefault()
                      if (typeof (frame) !== 'undefined') {
                        frame.close()
                      }
                      frame = wp.media.frames.su_media_frame_1 = wp.media(
                        {
                          title: SUGL10n.isp_media_title,
                          library: {
                            type: 'image'
                          },
                          button: {
                            text: SUGL10n.isp_media_insert
                          },
                          multiple: true
                        }
                      )
                      frame.on('open', function () {
                        $('.mfp-wrap').addClass('hidden')
                      })
                      frame.on('close', function () {
                        $('.mfp-wrap').removeClass('hidden')
                      })
                      frame.on(
                        'select',
                        function () {
                          var files = frame.state().get('selection').toJSON()
                          $images.find('em').remove()
                          $.each(
                            files,
                            function (i) {
                              $images.append('<span data-id="' + this.id + '" title="' + this.title + '"><img src="' + this.url + '" alt="" /><i class="sui sui-times"></i></span>')
                            }
                          )
                          update()
                        }
                      ).open()
                    }
                  )
                  // Sort images
                  $images.sortable(
                    {
                      revert: 200,
                      containment: $picker,
                      tolerance: 'pointer',
                      stop: function () {
                        update()
                      }
                    }
                  )
                  // Select categories and terms
                  $cats.on('change', update)
                  $terms.on('change', update)
                  // Select taxonomy
                  $taxes.on(
                    'change',
                    function () {
                      var $cont = $(this).parents('.su-generator-isp-source')
                      var tax = $(this).val()
                      // Remove terms
                      $terms.hide().find('option').remove()
                      update()
                      // Taxonomy is not selected
                      if (tax === '0') {

                      } else { // Taxonomy selected
                        var ajaxTermSelect = $.ajax(
                          {
                            url: ajaxurl,
                            type: 'post',
                            dataType: 'html',
                            data: {
                              action: 'su_generator_get_terms',
                              tax: tax,
                              class: 'su-generator-isp-terms',
                              multiple: true,
                              size: 10
                            },
                            beforeSend: function () {
                              if (typeof ajaxTermSelect === 'object') {
                                ajaxTermSelect.abort()
                              }
                              $terms.html('').attr('disabled', true).hide()
                              $cont.addClass('su-generator-loading')
                            },
                            success: function (data) {
                              $terms.html(data).attr('disabled', false).show()
                              $cont.removeClass('su-generator-loading')
                            }
                          }
                        )
                      }
                    }
                  )
                }
              )
              // Init media buttons
              $('.su-generator-upload-button').each(
                function () {
                  var $button = $(this)
                  var $val = $(this).parents('.su-generator-attr-container').find('input:text')
                  var file
                  $button.on(
                    'click',
                    function (e) {
                      e.preventDefault()
                      e.stopPropagation()
                      // If the frame already exists, reopen it
                      if (typeof (file) !== 'undefined') {
                        file.close()
                      }
                      // Create WP media frame.
                      file = wp.media.frames.su_media_frame_2 = wp.media(
                        {
                          // Title of media manager frame
                          title: SUGL10n.upload_title,
                          button: {
                            // Button text
                            text: SUGL10n.upload_insert
                          },
                          // Do not allow multiple files, if you want multiple, set true
                          multiple: false
                        }
                      )
                      // callback for selected image
                      file.on(
                        'select',
                        function () {
                          var attachment = file.state().get('selection').first().toJSON()
                          $val.val(attachment.url).trigger('change')
                        }
                      )
                      file.on('open', function () {
                        $('.mfp-wrap').addClass('hidden')
                      })
                      file.on('close', function () {
                        $('.mfp-wrap').removeClass('hidden')
                      })
                      // Open modal
                      file.open()
                    }
                  )
                }
              )
              // Init icon pickers
              $('.su-generator-icon-picker-button').each(
                function () {
                  var $button = $(this)
                  var $field = $(this).parents('.su-generator-attr-container')
                  var $val = $field.find('.su-generator-attr')
                  var $picker = $field.find('.su-generator-icon-picker')
                  var $filter = $picker.find('input:text')
                  $button.click(
                    function (e) {
                      $picker.toggleClass('su-generator-icon-picker-visible')
                      $filter.val('').trigger('keyup')
                      if ($picker.hasClass('su-generator-icon-picker-loaded')) {
                        return
                      }
                      // Load icons
                      $.ajax(
                        {
                          type: 'post',
                          url: ajaxurl,
                          data: {
                            action: 'su_generator_get_icons'
                          },
                          dataType: 'html',
                          beforeSend: function () {
                            // Show loading animation
                            $picker.addClass('su-generator-loading')
                            // Add loaded class
                            $picker.addClass('su-generator-icon-picker-loaded')
                          },
                          success: function (data) {
                            $picker.append(data)
                            var $icons = $picker.children('i')
                            $icons.click(
                              function (e) {
                                $val.val('icon: ' + $(this).attr('title'))
                                $picker.removeClass('su-generator-icon-picker-visible')
                                $val.trigger('change')
                                e.preventDefault()
                              }
                            )
                            $filter.on(
                              {
                                keyup: function () {
                                  var val = $(this).val()
                                  var regex = new RegExp(val, 'gi')
                                  // Hide all choices
                                  $icons.hide()
                                  // Find searched choices and show
                                  $icons.each(
                                    function () {
                                      // Get shortcode name
                                      var name = $(this).attr('title')
                                      // Show choice if matched
                                      if (name.match(regex) !== null) {
                                        $(this).show()
                                      }
                                    }
                                  )
                                },
                                focus: function () {
                                  $(this).val('')
                                  $icons.show()
                                }
                              }
                            )
                            $picker.removeClass('su-generator-loading')
                          }
                        }
                      )
                      e.preventDefault()
                    }
                  )
                }
              )
              // Init switches
              $('.su-generator-switch').click(
                function (e) {
                  // Prepare data
                  var $switch = $(this)
                  var $value = $switch.parent().children('input')
                  var isOn = $value.val() === 'yes'
                  // Disable
                  if (isOn) {
                    // Change value
                    $value.val('no').trigger('change')
                  } else { // Enable
                    // Change value
                    $value.val('yes').trigger('change')
                  }
                  e.preventDefault()
                }
              )
              $('.su-generator-switch-value').on(
                'change',
                function () {
                  // Prepare data
                  var $value = $(this)
                  var $switch = $value.parent().children('.su-generator-switch')
                  var value = $value.val()
                  // Disable
                  if (value === 'yes') {
                    $switch.removeClass('su-generator-switch-no').addClass('su-generator-switch-yes')
                  } else if (value === 'no') { // Enable
                    $switch.removeClass('su-generator-switch-yes').addClass('su-generator-switch-no')
                  }
                }
              )
              // Init tax_term selects
              $('select#su-generator-attr-taxonomy').on(
                'change',
                function () {
                  var $taxonomy = $(this)
                  var tax = $taxonomy.val()
                  var $terms = $('select#su-generator-attr-tax_term')
                  // Load new options
                  window.su_generator_get_terms = $.ajax(
                    {
                      type: 'POST',
                      url: ajaxurl,
                      data: {
                        action: 'su_generator_get_terms',
                        tax: tax,
                        noselect: true
                      },
                      dataType: 'html',
                      beforeSend: function () {
                        // Check previous requests
                        if (typeof window.su_generator_get_terms === 'object') {
                          window.su_generator_get_terms.abort()
                        }
                        // Show loading animation
                        $terms.parent().addClass('su-generator-loading')
                      },
                      success: function (data) {
                        // Remove previous options
                        $terms.find('option').remove()
                        // Append new options
                        $terms.append(data)
                        // Hide loading animation
                        $terms.parent().removeClass('su-generator-loading')
                      }
                    }
                  )
                }
              )
              // Init shadow pickers
              $('.su-generator-shadow-picker').each(
                function (index) {
                  var $picker = $(this)
                  var $fields = $picker.find('.su-generator-shadow-picker-field input')
                  var $hoff = $picker.find('.su-generator-sp-hoff')
                  var $voff = $picker.find('.su-generator-sp-voff')
                  var $blur = $picker.find('.su-generator-sp-blur')
                  var $color = {
                    cnt: $picker.find('.su-generator-shadow-picker-color'),
                    value: $picker.find('.su-generator-shadow-picker-color-value'),
                    wheel: $picker.find('.su-generator-shadow-picker-color-wheel')
                  }
                  var $val = $picker.find('.su-generator-attr')
                  // Init color picker
                  $color.wheel.farbtastic($color.value)
                  $color.value.focus(
                    function () {
                      $color.wheel.show()
                    }
                  )
                  $color.value.blur(
                    function () {
                      $color.wheel.hide()
                    }
                  )
                  // Handle text fields
                  $fields.on(
                    'change blur keyup',
                    function () {
                      $val.val($hoff.val() + 'px ' + $voff.val() + 'px ' + $blur.val() + 'px ' + $color.value.val()).trigger('change')
                    }
                  )
                  $val.on(
                    'keyup',
                    function () {
                      var value = $(this).val().split(' ')
                      // Value is correct
                      if (value.length === 4) {
                        $hoff.val(value[0].replace('px', ''))
                        $voff.val(value[1].replace('px', ''))
                        $blur.val(value[2].replace('px', ''))
                        $color.value.val(value[3])
                        $fields.trigger('keyup')
                      }
                    }
                  )
                }
              )
              // Init border pickers
              $('.su-generator-border-picker').each(
                function (index) {
                  var $picker = $(this)
                  var $fields = $picker.find('.su-generator-border-picker-field input, .su-generator-border-picker-field select')
                  var $width = $picker.find('.su-generator-bp-width')
                  var $style = $picker.find('.su-generator-bp-style')
                  var $color = {
                    cnt: $picker.find('.su-generator-border-picker-color'),
                    value: $picker.find('.su-generator-border-picker-color-value'),
                    wheel: $picker.find('.su-generator-border-picker-color-wheel')
                  }
                  var $val = $picker.find('.su-generator-attr')
                  // Init color picker
                  $color.wheel.farbtastic($color.value)
                  $color.value.focus(
                    function () {
                      $color.wheel.show()
                    }
                  )
                  $color.value.blur(
                    function () {
                      $color.wheel.hide()
                    }
                  )
                  // Handle text fields
                  $fields.on(
                    'change blur keyup',
                    function () {
                      $val.val($width.val() + 'px ' + $style.val() + ' ' + $color.value.val()).trigger('change')
                    }
                  )
                  $val.on(
                    'keyup',
                    function () {
                      var value = $(this).val().split(' ')
                      // Value is correct
                      if (value.length === 3) {
                        $width.val(value[0].replace('px', ''))
                        $style.val(value[1])
                        $color.value.val(value[2])
                        $fields.trigger('keyup')
                      }
                    }
                  )
                }
              )
              // Remove skip class when setting is changed
              $settings.find('.su-generator-attr').on(
                'change keyup blur',
                function () {
                  var $cnt = $(this).parents('.su-generator-attr-container')
                  var _default = $cnt.data('default')
                  var val = $(this).val()
                  // Value is changed
                  if (val != _default) {
                    $cnt.removeClass('su-generator-skip')
                  } else {
                    $cnt.addClass('su-generator-skip')
                  }
                }
              )
              // Init value setters
              $('.su-generator-set-value').click(
                function (e) {
                  $(this).parents('.su-generator-attr-container').find('input').val($(this).text()).trigger('change')
                }
              )
              // Save selected value
              $selected.val(shortcode)
              // Load last used preset
              $.ajax(
                {
                  type: 'GET',
                  url: ajaxurl,
                  data: {
                    action: 'su_generator_get_preset',
                    id: 'last_used',
                    shortcode: shortcode
                  },
                  beforeSend: function () {
                    // Show loading animation
                    // $settings.addClass('su-generator-loading');
                  },
                  success: function (data) {
                    // Remove loading animation
                    // $settings.removeClass('su-generator-loading');
                    // Set new settings
                    self.setSettings(data)
                    // Apply selected text to the content field
                    var $content = $('#su-generator-content')
                    if (typeof self.state.mceSelection !== 'undefined' && self.state.mceSelection !== '' && $content.attr('type') !== 'hidden') {
                      $content.val(self.state.mceSelection)
                    }
                  },
                  dataType: 'json'
                }
              )
            },
            dataType: 'html'
          }
        )
      }
    )
    // Insert shortcode
    $('#su-generator').on('click', '.su-generator-insert', self.insertShortcode)
    // Preview shortcode
    $('#su-generator').on(
      'click',
      '.su-generator-toggle-preview',
      function (e) {
        // Prepare data
        var $preview = $('#su-generator-preview')
        var $button = $(this)
        // Hide button
        $button.hide()
        // Show preview box
        $preview.addClass('su-generator-loading').show()
        // Bind updating on settings changes
        $settings.find('input, textarea, select').on(
          'change keyup blur',
          function () {
            self.updatePreview()
          }
        )
        // Update preview box
        self.updatePreview(true)
        // Prevent default action
        e.preventDefault()
      }
    )
    var gp_hover_timer
    // Presets manager - mouseenter
    $('#su-generator').on(
      'mouseenter click',
      '.su-generator-presets',
      function () {
        clearTimeout(gp_hover_timer)
        $('.su-gp-popup').show()
      }
    )
    // Presets manager - mouseleave
    $('#su-generator').on(
      'mouseleave',
      '.su-generator-presets',
      function () {
        gp_hover_timer = window.setTimeout(
          function () {
            $('.su-gp-popup').fadeOut(200)
          },
          600
        )
      }
    )
    // Presets manager - add new preset
    $('#su-generator').on(
      'click',
      '.su-gp-new',
      function (e) {
        // Prepare data
        var $container = $(this).parents('.su-generator-presets')
        var $list = $('.su-gp-list')
        var id = new Date().getTime()
        // Ask for preset name
        var name = prompt(SUGL10n.presets_prompt_msg, SUGL10n.presets_prompt_value)
        // Name is entered
        if (name !== '' && name !== null) {
          // Hide default text
          $list.find('b').hide()
          // Add new option
          $list.append('<span data-id="' + id + '"><em>' + name + '</em><i class="sui sui-times"></i></span>')
          // Perform AJAX request
          self.addPreset(id, name)
        }
      }
    )
    // Presets manager - load preset
    $('#su-generator').on(
      'click',
      '.su-gp-list span',
      function (e) {
        // Prepare data
        var shortcode = $('.su-generator-presets').data('shortcode')
        var id = $(this).data('id')
        var $insert = $('.su-generator-insert')
        // Hide popup
        $('.su-gp-popup').hide()
        // Disable hover timer
        clearTimeout(gp_hover_timer)
        // Get the preset
        $.ajax(
          {
            type: 'GET',
            url: ajaxurl,
            data: {
              action: 'su_generator_get_preset',
              id: id,
              shortcode: shortcode
            },
            beforeSend: function () {
              // Disable insert button
              $insert.addClass('button-primary-disabled').attr('disabled', true)
            },
            success: function (data) {
              // Enable insert button
              $insert.removeClass('button-primary-disabled').attr('disabled', false)
              // Set new settings
              self.setSettings(data)
            },
            dataType: 'json'
          }
        )
        // Prevent default action
        e.preventDefault()
        e.stopPropagation()
      }
    )
    // Presets manager - remove preset
    $('#su-generator').on(
      'click',
      '.su-gp-list i',
      function (e) {
        // Prepare data
        var $list = $(this).parents('.su-gp-list')
        var $preset = $(this).parent('span')
        var id = $preset.data('id')
        // Remove DOM element
        $preset.remove()
        // Show default text if last preset was removed
        if ($list.find('span').length < 1) {
          $list.find('b').show()
        }
        // Perform ajax request
        self.removePreset(id)
        // Prevent <span> action
        e.stopPropagation()
        // Prevent default action
        e.preventDefault()
      }
    )
  }

  /**
	 * Create new preset with specified name from current settings
	 */
  self.addPreset = function (id, name) {
    // Prepare shortcode name and current settings
    var shortcode = $('.su-generator-presets').data('shortcode')
    var settings = self.getSettings()
    // Perform AJAX request
    $.ajax(
      {
        type: 'POST',
        url: ajaxurl,
        data: {
          action: 'su_generator_add_preset',
          id: id,
          name: name,
          shortcode: shortcode,
          settings: settings
        }
      }
    )
  }
  /**
	 * Remove preset by ID
	 */
  self.removePreset = function (id) {
    // Get current shortcode name
    var shortcode = $('.su-generator-presets').data('shortcode')
    // Perform AJAX request
    $.ajax(
      {
        type: 'POST',
        url: ajaxurl,
        data: {
          action: 'su_generator_remove_preset',
          id: id,
          shortcode: shortcode
        }
      }
    )
  }

  self.parseSettings = function () {
    // Prepare data
    var query = $selected.val()
    var prefix = $prefix.val()
    var $settings = $('#su-generator-settings .su-generator-attr-container:not(.su-generator-skip) .su-generator-attr')
    var $content = $('textarea#su-generator-content')
    var content = $content.length ? $content.val() : 'false'
    var result = new String('')
    // Open shortcode
    result += '[' + prefix + query
    // Add shortcode attributes
    $settings.each(
      function () {
        // Prepare field and value
        var $this = $(this)
        var value = ''
        // Selects
        if ($this.is('select')) {
          value = $this.find('option:selected').val()
        }
        // Other fields
        else {
          value = $this.val()
        }
        // Check that value is not empty
        if (value == null) {
          value = ''
        } else if (typeof value === 'array') {
          value = value.join(',')
        }
        // Add attribute
        if (value !== '') {
          result += ' ' + $(this).attr('name') + '="' + $(this).val().toString().replace(/"/gi, "'") + '"'
        }
      }
    )
    // End of opening tag
    result += ']'
    // Wrap shortcode if content presented
    if (content != 'false') {
      result += content + '[/' + prefix + query + ']'
    }
    // Return result
    return result
  }

  self.getSettings = function () {
    // Prepare data
    var query = $selected.val()
    var $settings = $('#su-generator-settings .su-generator-attr')
    var $content = $('textarea#su-generator-content')
    var content = $content.length ? $content.val() : 'false'
    var data = {}
    // Add shortcode attributes
    $settings.each(
      function (i) {
        // Prepare field and value
        var $this = $(this)
        var value = ''
        var name = $this.attr('name')
        // Selects
        if ($this.is('select')) {
          value = $this.find('option:selected').val()
        }
        // Other fields
        else {
          value = $this.val()
        }
        // Check that value is not empty
        if (value == null) {
          value = ''
        }
        // Save value
        data[name] = value
      }
    )
    // Add content
    data.content = content.toString()
    // Return data
    return data
  }

  self.setSettings = function (data) {
    // Prepare data
    var $settings = $('#su-generator-settings .su-generator-attr')
    var $content = $('#su-generator-content')
    // Loop through settings
    $settings.each(
      function () {
        var $this = $(this)
        var name = $this.attr('name')
        // Data contains value for this field
        if (data.hasOwnProperty(name)) {
          // Set new value
          $this.val(data[name])
          $this.trigger('keyup').trigger('change').trigger('blur')
        }
      }
    )
    // Set content
    if (data.hasOwnProperty('content')) {
      $content.val(data.content).trigger('keyup').trigger('change').trigger('blur')
    }
    // Update preview
    self.updatePreview()
  }

  self.updatePreview = function (forced) {
    // Prepare data
    var $preview = $('#su-generator-preview')
    var shortcode = self.parseSettings()
    var previous = $result.text()
    // Check forced mode
    forced = forced || false
    // Break if preview box is hidden (preview isn't enabled)
    if (!$preview.is(':visible')) {
      return
    }
    // Check shortcode is changed is this is not a forced mode
    if (shortcode === previous && !forced) {
      return
    }
    // Run timer to filter often calls
    window.clearTimeout(self.state.preview.timer)
    self.state.preview.timer = window.setTimeout(
      function () {
        self.state.preview.request = $.ajax(
          {
            type: 'POST',
            url: ajaxurl,
            cache: false,
            data: {
              action: 'su_generator_preview',
              shortcode: shortcode
            },
            beforeSend: function () {
              // Abort previous requests
              if (self.state.preview.request) {
                self.state.preview.request.abort()
              }
              // Show loading animation
              $preview.addClass('su-generator-loading').html('')
            },
            success: function (data) {
              // Hide loading animation and set new HTML
              $preview.html(data).removeClass('su-generator-loading')
            },
            dataType: 'html'
          }
        )
      },
      300
    )
    // Save shortcode to div
    $result.text(shortcode)
  }

  self.insert = function (context, args) {
    if (typeof context !== 'string' || typeof args !== 'object') {
      return
    }

    self.state.context = context
    self.state.insertArgs = args

    var preSelectedShortcode = args.shortcode || ''

    var mfpOptions = {
      type: 'inline',
      alignTop: true,
      closeOnBgClick: false,
      mainClass: 'su-generator-mfp',
      items: {
        src: '#su-generator'
      },
      callbacks: {}
    }

    mfpOptions.callbacks.open = () => {
      if (preSelectedShortcode) {
        $choice.filter(`[data-shortcode="${preSelectedShortcode}"]`).trigger('click')
      } else {
        window.setTimeout(() => $search.focus(), 200)
      }

      // self.el.body.addClass( 'su-mfp-shown' );

      if (
        typeof tinyMCE !== 'undefined' &&
				tinyMCE.activeEditor != null &&
				tinyMCE.activeEditor.hasOwnProperty('selection')
      ) {
        self.state.mceSelection = tinyMCE.activeEditor.selection.getContent({ format: 'text' })
      }
    }

    mfpOptions.callbacks.close = () => {
      $search.val('')
      $settings.html('').hide()
      $generator.removeClass('su-generator-narrow')
      $filter.show()
      $choices.show()
      $choice.show()

      self.state.mceSelection = ''

      // self.el.body.removeClass( 'su-mfp-shown' );
    }

    $.magnificPopup.open(mfpOptions)
  }

  self.insertShortcode = function () {
    var shortcode = self.parseSettings()

    self.addPreset('last_used', SUGL10n.last_used)

    $.magnificPopup.close()

    $result.text(shortcode)

    if (self.state.context === 'classic') {
      self.state.wpActiveEditor = window.wpActiveEditor
      window.wpActiveEditor = self.state.insertArgs.editorID
      window.wp.media.editor.insert(shortcode)
      window.wpActiveEditor = self.state.wpActiveEditor
    } else if (self.state.context === 'block') {
      var props = self.state.insertArgs.props

      if (props.attributes.hasOwnProperty('content')) {
        props.setAttributes({ content: props.attributes.content + shortcode })
      } else if (props.name === 'core/shortcode') {
        var originalText = props.attributes.hasOwnProperty('text')
          ? props.attributes.text
          : ''

        props.setAttributes({ text: originalText + shortcode })

        // var textarea = document.querySelector( `#block-${props.clientId} textarea` );
        // self.insertAtCaret( textarea, shortcode );
      }
    }
  }

  self.insertAtCaret = (field, text) => {
    var start = field.selectionStart
    var end = field.selectionEnd

    field.value = field.value.substring(0, start) + text + field.value.substring(start)

    field.focus()

    field.selectionStart = start + text.length
  }

  return {
    init: self.init,
    insert: self.insert
  }
})(jQuery)

jQuery(document).ready(window.SUG.App.init)
