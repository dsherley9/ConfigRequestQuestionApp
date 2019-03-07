$(document).ready(function () {

    //Bind Builds DataTable
    $('#myTable').DataTable({
        "scrollY": '45vh',//$(window).height() * 50 / 100,
        "scrollCollapse": true,
        initComplete: function () {
            this.api().columns().every(function () {
                var column = this;
                var select = $('<select class="browser-default custom-select"><option value=""></option></select>')
                    .appendTo($(column.header('div.row.myTable-column-filter')))
                    .on('change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        column
                            .search(val ? '^' + val + '$' : '', true, false)
                            .draw();
                    });

                column.data().unique().sort().each(function (d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                });
            });
        }
    });

    //Bind Builds DataTable Click
    $("#myTable tbody tr").on("click", function (e) {
        var buildURL = $(this).data('request-url');
        window.location = buildURL;
        //alert(buildURL);
    });


});