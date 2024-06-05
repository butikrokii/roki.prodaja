var TableManaged = function () {

    const ajax = async (url, method, data = null) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': crsf,
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
    }
    var initTable2 = function () {
        window.product_delete = button => {
            if (confirm('Sigurno?')) {
                return alert('Trenutno se jos radi na ovom koraku.')
                ajax(
                    `${location.origin}${location.pathname}/${button.dataset.id}`,
                    'DELETE'
                )
            }
        }

        var table = $('#sample_2');

        table.DataTable({
            ajax: {
                url: `${location.origin}${location.pathname}`,
                dataSrc: '',
            },
            language: {
                aria: {
                    sortAscending: ": activate to sort column ascending",
                    sortDescending: ": activate to sort column descending"
                },
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "No entries found",
                infoFiltered: "(filtered1 from _MAX_ total entries)",
                lengthMenu: "Show _MENU_ entries",
                search: "Search:",
                zeroRecords: "No matching records found",
                paging: {
                    previous: "Prev",
                    next: "Next"
                }
            },
            bStateSave: true, // save datatable state(pagination, sort, etc) in cookie.

            lengthMenu: [
                [5, 15, 20, -1],
                [5, 15, 20, "All"] // change per page values here
            ],

            columns: [
                {
                    title: '<input type="checkbox" value="0"> Odaberi sve',
                    render: (data, type, row) => `<input type="checkbox" value="${row.id}">`
                },
                {data: 'id', title: 'ID'},
                {
                    data: 'title', title: 'Naziv', render: (data, type, {variants}, {col, row, settings}) => {
                        const btn = document.createElement('button')
                        const icon = document.createElement('i')

                        const variantAttrMap = {
                            size: 'Velicina', color: 'Boja', stocks: 'Raspoloziva kolicina'
                        }
                        const generateTable = (data) => `<table class="table table-condensed">
                                <thead>
                                    <tr>${Object.keys(data[0]).filter(key => variantAttrMap[key]).map(key => `<th>${variantAttrMap[key]}</th>`).join('')}</tr>
                                </thead>
                                <tbody>${data.map(
                                    item => `<tr>${Object.entries(variantAttrMap)
                                        .filter(([key, value]) => item.hasOwnProperty(key))
                                        .map(([key, value]) => `<td>${item[key]}</td>`).join('')}</tr>`
                                    ).join('')}
                                </tbody>
                            </table>`

                        icon.className = 'fa fa-toggle-right'
                        btn.append(icon)

                        window[`variant_toggle_${row}`] = e => {
                            if (e.target.classList.contains('fa-toggle-right')) {
                                e.target.className = 'fa fa-toggle-down'
                                table.DataTable().row(row).child(generateTable(variants)).show()
                                return
                            }

                            table.DataTable().row(row).child().hide()
                            e.target.className = 'fa fa-toggle-right'
                        }

                        btn.setAttribute('onclick', `window.variant_toggle_${row}(event)`)

                        return `<span>${btn.outerHTML}${data}</span>`
                    }
                },
                { data: 'price', title: 'Cijena' },
                { data: 'options', title: 'Opcije', render: (data, type, {id}) => {
                    return `<div class="btn-group btn-group-solid">
                        <a type="button" class="btn yellow" href="${location.origin}${location.pathname}/${id}/edit">Azuriraj</a>
                        <button type="button" class="btn red" data-id="${id}" onclick="window.product_delete(this)">Obrisi</button>
                    </div>`
                }}
            ],

            pageLength: 5,
            columnDefs: [{  // set default column settings
                orderable: false,
                targets: [0]
            }, {
                searchable: false,
                targets: [0]
            }],
            order: [
                [1, "asc"]
            ]
        });

        var tableWrapper = jQuery('#sample_2_wrapper');

        table.find('.group-checkable').change(function () {
            var set = jQuery(this).attr("data-set");
            var checked = jQuery(this).is(":checked");
            jQuery(set).each(function () {
                if (checked) {
                    $(this).attr("checked", true);
                } else {
                    $(this).attr("checked", false);
                }
            });
            jQuery.uniform.update(set);
        });

        tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
    }

    return {

        //main function to initiate the module
        init: function () {
            if (!jQuery().dataTable) {
                return;
            }
            initTable2();
        }

    };

}();
