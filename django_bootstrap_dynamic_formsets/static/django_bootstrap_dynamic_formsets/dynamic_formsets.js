$(document).ready(function() {

    // Checks if input is empty or, in case of a checkbox, unchecked
    var checkEmpty = function($inputToCheck) {
        var isEmpty = false;
        if ($inputToCheck.attr('type') === 'checkbox') {
            isEmpty = !$inputToCheck.prop('checked');
        } else {
            $inputToCheck.filter(function() {
                isEmpty = !this.value;
                return false;
            });
        }
        return isEmpty;
    };

    //Checks if all inputs in this container are empty/unchecked
    var allEmpty = function($toCheck) {
        var isEmpty = true;
        $toCheck.find('input').each(function() {
            if (!checkEmpty($(this))) {
                isEmpty = false;
                return false;
            }
        });
        return isEmpty;
    };


    //Writes the correct current order in the order form fields
    var correctOrder = function() {
        var localSortItemCounter = 1;
        $("[id$=ORDER]").each(function() {
            $(this).attr('value', localSortItemCounter);
            localSortItemCounter++;
        });
    };

    //Hide "Order" and "Delete" field/checkbox
    $("[id$=ORDER]").parents(".form-group").hide();
    $("[id$=DELETE]").parents(".form-group").hide();

    //Holds an empty form
    var $emptyForm = $('#' + (formsetPrefix ? formsetPrefix + '-' : '') + 'empty-form').remove().children().unwrap();

    var $sortItem = $('.sort-item' + (formsetPrefix ? '.' + formsetPrefix : ''));

    //Disable Up button on first and Down button on last form
    var setUpDownButtons = function() {
        $sortItem = $('.sort-item' + (formsetPrefix ? '.' + formsetPrefix : ''));
        $sortItem.find(".up-form" + (formsetPrefix ? '-' + formsetPrefix : ''), ".down-form" + (formsetPrefix ? '-' + formsetPrefix : '')).each(function() {
            $(this).prop("disabled", false);
        });
        $sortItem.first().find(".up-form" + (formsetPrefix ? '-' + formsetPrefix : '')).prop("disabled", true);
        $sortItem.last().find(".down-form" + (formsetPrefix ? '-' + formsetPrefix : '')).prop("disabled", true);
    };


    //Hide forms that are marked for deletion
    $sortItem.find('[id$=DELETE]').each(function() {
        if ($(this).prop('checked')) {
            $(this).parents(".sort-item").hide();
        }
    });


    //Counts the number of forms
    var sortItemCounter = 0;
    $sortItem.each(function() {
        sortItemCounter++;
    });
    //$('body').prepend('<p>Count ({{formset.prefix}}): ' + sortItemCounter + '</p>');

    //Mark initial forms as such
    var numInitialForms = $('#id_' + (formsetPrefix ? formsetPrefix + '-' : '') + 'INITIAL_FORMS').val();
    var i = 0;
    $sortItem.each(function() {
        if (i < numInitialForms) {
            $(this).addClass("initial-form");
            i++;
        } else {
            return false;
        }
    });

    var numTotalForms = $('#id_' + (formsetPrefix ? formsetPrefix + '-' : '') + 'TOTAL_FORMS').val();
    //Fix order (important if page reloads after validation failed)
    for (i = 1; i < numTotalForms; i++) {
        $sortItem.find('[id$=ORDER][value=' + (i + 1) + ']').parents(".sort-item").insertAfter($sortItem.find('[id$=ORDER][value=' + i + ']').parents(".sort-item"));
    }


    //Set up sortable jQuery UI interaction
    if (canOrder) {

        var $sortable = $('#sortable' + (formsetPrefix ? '-' + formsetPrefix : ''));

        $sortable.sortable({
            items: ".sort-item" + (formsetPrefix ? '.' + formsetPrefix : ''),
            axis: "y",
            scrollSensitivity: 100,
            scrollSpeed: 5,
            tolerance: "intersect",
            handle: ".sort-handle" + (formsetPrefix ? '-' + formsetPrefix : ''),
            cancel: "input, textarea, select, option",
        });
        $sortable.on("sortupdate", function(event, ui) {
            setUpDownButtons();
        });
        setUpDownButtons();

        $(document).on('click', '.up-form' + (formsetPrefix ? '-' + formsetPrefix : ''), function() {
            var $parentSortItem = $(this).parents(".sort-item");
            $parentSortItem.insertBefore($parentSortItem.prev());
            setUpDownButtons();
        });

        $(document).on('click', '.down-form' + (formsetPrefix ? '-' + formsetPrefix : ''), function() {
            var $parentSortItem = $(this).parents(".sort-item");
            $parentSortItem.insertAfter($parentSortItem.next());
            setUpDownButtons();
        });


    }



    // Remove form
    $(document).on('click', '.delete-form' + (formsetPrefix ? '-' + formsetPrefix : ''), function() {
        console.log("Attempting to delete form " + formsetPrefix);
        console.log($(this));
        var $parentSortItem = $(this).parents(".sort-item");
        if ($parentSortItem.hasClass((formsetPrefix ? formsetPrefix + '-' : '') + 'initial-form')) {
            $parentSortItem.effect('drop');
            $parentSortItem.find('[id$=DELETE]').prop('checked', true);
        } else {
            $parentSortItem.effect('drop', function() {
                $(this).remove();
                sortItemCounter--;
                console.log(sortItemCounter);
                $('#id_' + (formsetPrefix ? formsetPrefix + '-' : '') + 'TOTAL_FORMS').attr('value', sortItemCounter);
            });
        }
    });

    // Add form
    $(document).on('click', '.add-form' + (formsetPrefix ? '-' + formsetPrefix : ''), function() {
        var formCopy = $emptyForm.clone();
        var formCopyString = formCopy.html().replace(/__prefix__/g, "" + sortItemCounter);
        formCopy.html(formCopyString);
        sortItemCounter++;
        $(this).parents(".sort-item").after(formCopy);
        $('#id_' + (formsetPrefix ? formsetPrefix + '-' : '') + 'TOTAL_FORMS').attr('value', sortItemCounter);
    });

    //Submit formset
    $('#form-submit-' + (formsetPrefix ? formsetPrefix : '')).click(function(e) {
        e.preventDefault();
        $('.sort-item' + (formsetPrefix ? '.' + formsetPrefix : '')).each(function() {
            if (allEmpty($(this))) {
                console.log("I'm all empty, so removing myself!");
                $(this).remove();
            } else {
                console.log("Not empty, so not removing!");
            }
        });
        if (canOrder) {
            correctOrder();
        }
        $(this).parents("form").submit();
    });

});
