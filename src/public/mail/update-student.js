'use strict';
(function ($, window, document, undefined) {
  var pluginName = 'editable',
    defaults = {
      keyboard: true,
      dblclick: true,
      button: true,
      buttonSelector: "button[aria-label='Edit']",
      maintainWidth: true,
      dropdowns: {},
      edit: function () {},
      save: function () {},
      cancel: function () {},
    };

  function editable(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  editable.prototype = {
    init: function () {
      this.editing = false;

      if (this.options.dblclick) {
        $(this.element)
          .css('cursor', 'pointer')
          .bind('dblclick', this.toggle.bind(this));
      }

      if (this.options.button) {
        $(this.options.buttonSelector, this.element).bind(
          'click',
          this.toggle.bind(this)
        );
      }
    },

    toggle: function (e) {
      e.preventDefault();
      this.editing = !this.editing;

      if (this.editing) {
        this.edit();
      } else {
        this.save();
      }
    },

    edit: function () {
      var instance = this,
        values = {};

      // Store the student ID from the row's data attribute
      this.studentId = $(this.element).data('student-id');

      $('td:not(:last-child)', this.element).each(function () {
        var input,
          field =
            $(this).find('p, span').length > 0
              ? $(this).find('p, span').first()
              : $(this),
          value = field.text().trim(),
          width = $(this).width();

        // Store the field name as a data attribute
        const fieldName = $(this).data('field');

        const originalField = field.clone();
        values[fieldName] = value;

        if ($(this).hasClass('status-cell')) {
          input = $(
            '<select class="w-full px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg"></select>'
          );
          const options = ['Approved', 'Pending', 'Denied'];
          options.forEach((option) => {
            $('<option></option>').text(option).appendTo(input);
          });
        } else {
          input = $(
            '<input type="text" class="w-full px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg" />'
          );
        }

        input
          .val(value)
          .data('old-value', value)
          .data('field-name', fieldName)
          .data('original-field', originalField);

        if (field.is('p, span')) {
          field.html(input);
        } else {
          $(this).html(input);
        }

        if (instance.options.keyboard) {
          input.keydown(instance._captureKey.bind(instance));
        }
      });

      // Change edit button to save
      $("button[aria-label='Edit'] svg", this.element)
        .attr('viewBox', '0 0 20 20')
        .html(
          '<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>'
        );

      this.options.edit.bind(this.element)(values);
    },

    save: function () {
      var instance = this,
        values = {};

      const studentId = this.studentId;

      $('td:not(:last-child)', this.element).each(function () {
        var input = $(this).find(':input'),
          value = input.val(),
          fieldName = input.data('field-name'),
          originalField = input.data('original-field');

        values[fieldName] = value;

        // Don't update the UI until we get success from the server
        instance.currentInput = input;
        instance.currentOriginalField = originalField;
      });

      // Send AJAX request to update the database
      $.ajax({
        url: `/admin/student/${studentId}`,
        method: 'PUT',
        data: values,
        success: function (response) {
          // Update UI only after successful save
          $('td:not(:last-child)', instance.element).each(function () {
            var input = $(this).find(':input'),
              value = input.val(),
              originalField = input.data('original-field');

            if (originalField.is('p, span')) {
              input.parent().html(value);
            } else {
              $(this).html(value);
            }
          });

          // Restore edit button
          $("button[aria-label='Edit'] svg", instance.element)
            .attr('viewBox', '0 0 20 20')
            .html(
              '<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>'
            );

          // Show success message
          showNotification('Student updated successfully', 'success');
        },
        error: function (xhr, status, error) {
          // Revert changes on error
          instance.cancel();
          showNotification('Failed to update student: ' + error, 'error');
        },
      });

      this.options.save.bind(this.element)(values);
    },

    cancel: function () {
      var instance = this,
        values = {};

      $('td:not(:last-child)', this.element).each(function () {
        var input = $(this).find(':input'),
          value = input.data('old-value'),
          originalField = input.data('original-field');

        values[originalField.text()] = value;

        if (originalField.is('p, span')) {
          input.parent().html(value);
        } else {
          $(this).html(value);
        }
      });

      // Restore edit button
      $("button[aria-label='Edit'] svg", this.element)
        .attr('viewBox', '0 0 20 20')
        .html(
          '<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>'
        );

      this.options.cancel.bind(this.element)(values);
    },

    _captureKey: function (e) {
      if (e.which === 13) {
        this.editing = false;
        this.save();
      } else if (e.which === 27) {
        this.editing = false;
        this.cancel();
      }
    },
  };

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new editable(this, options));
      }
    });
  };
})(jQuery, window, document);

// Notification helper function
function showNotification(message, type) {
  alert(message);
}

// Initialize editable table
$(function () {
  $('#editableTable tbody tr').editable({
    edit: function (values) {
      $(this).find("button[aria-label='Edit']").attr('aria-label', 'Save');
    },
    save: function (values) {
      $(this).find("button[aria-label='Save']").attr('aria-label', 'Edit');
    },
    cancel: function (values) {
      $(this).find("button[aria-label='Save']").attr('aria-label', 'Edit');
    },
  });

  // Handle delete button clicks
  $("button[aria-label='Delete']").click(function (e) {
    const row = $(this).closest('tr');
    const studentId = row.data('student-id');

    if (confirm('Are you sure you want to delete this student?')) {
      $.ajax({
        url: `/admin/student/${studentId}`,
        method: 'DELETE',
        success: function (response) {
          row.remove();
          showNotification('Student deleted successfully', 'success');
        },
        error: function (xhr, status, error) {
          showNotification('Failed to delete student: ' + error, 'error');
        },
      });
    }
  });
});
