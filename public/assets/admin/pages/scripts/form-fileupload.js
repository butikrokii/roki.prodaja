var FormFileUpload = function () {


    return {
        //main function to initiate the module
        init: function (selector) {

             // Initialize the jQuery File Upload widget:
            $(selector).fileupload({
                // disableImageResize: false,
                autoUpload: false,
                disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
                maxFileSize: 5000000,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                // Uncomment the following to send cross-domain cookies:
                //xhrFields: {withCredentials: true},
                sequentialUploads: true,
                headers: {
                    'x-csrf-token': crsf,
                },
                completed: (e, {result, url}) => {
                    const inputImages = $('input[name=images][type=hidden]')
                    let imageIds = JSON.parse(inputImages.val()) || []

                    if (!url) {
                        imageIds = result.files.map(file => file.id)
                        return inputImages.val(JSON.stringify(imageIds))
                    }

                    result.files.forEach(file => {
                        imageIds.push(file.id)
                    })

                    return inputImages.val(JSON.stringify(imageIds))
                },
                destroyed: (e, {url}) => {
                    const imageId = parseInt(url.match(/admin\/file\/(\d+)/)[1])
                    const inputImages = $('input[name=images][type=hidden]')
                    const imageIds = JSON.parse(inputImages.val()).filter(id => id !== imageId)
                    inputImages.val(JSON.stringify(imageIds))
                }
            });

            // Enable iframe cross-domain access via redirect option:
            $(selector).fileupload(
                'option',
                'redirect',
                window.location.href.replace(
                    /\/[^\/]*$/,
                    '/cors/result.html?%s'
                )
            );

            // Upload server status check for browsers with CORS support:
            if ($.support.cors) {
                $.ajax({
                    type: 'HEAD'
                }).fail(function () {
                    $('<div class="alert alert-danger"/>')
                        .text('Upload server currently unavailable - ' +
                                new Date())
                        .appendTo(selector);
                });
            }

            if ($(selector).data("product-id")) {
                // Load & display existing files:
                $(selector).addClass('fileupload-processing');
                $.ajax({
                    // Uncomment the following to send cross-domain cookies:
                    //xhrFields: {withCredentials: true},
                    url: `${$(selector).attr("action")}?product_id=${$(selector).data("product-id")}`,
                    dataType: 'json',
                    context: $(selector)[0]
                }).always(function () {
                    $(this).removeClass('fileupload-processing');
                }).done(function (result) {
                    $(this).fileupload('option', 'done')
                        .call(this, $.Event('done'), {result: result});
                })
            }
        }

    };

}();
