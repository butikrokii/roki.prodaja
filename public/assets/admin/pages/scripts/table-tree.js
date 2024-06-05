var TableTree = function() {

    var demo1 = function() {

        // jQuery('#gtreetable-').gtreetable({
        //     'draggable': true,
        //     'source': function(id) {
        //         return {
        //             type: 'GET',
        //             url: location.pathname,
        //             data: {
        //                 'id': id
        //             },
        //             dataType: 'json',
        //             error: function(XMLHttpRequest) {
        //                 alert(XMLHttpRequest.status + ': ' + XMLHttpRequest.responseText);
        //             }
        //         }
        //     },
        //     'sort': function (a, b) {
        //         var aName = a.name.toLowerCase();
        //         var bName = b.name.toLowerCase();
        //         return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        //     },
        //     'types': {
        //         default: 'glyphicon glyphicon-triangle-right',
        //         folder: 'glyphicon glyphicon-folder-open'
        //     },
        //     'inputWidth': '255px'
        // });

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

        const createNode = async (url, data) => {
            return await ajax(url, 'POST', data)
        };

        const updateNode = async (url, data) => {
            return await ajax(url, 'PUT', data)
        };

        const deleteNode = async (url) => {
            return await ajax(url,'DELETE')
        };

        $('#gtreetable-new-root').click(async (e) => {
            const data = {text: `New root node`};
            const resp = await createNode(location.pathname, data);
            $('#gtreetable').jstree().create_node(null, resp);
        })
        $('#gtreetable').jstree({
            core: {
                check_callback: true,
                data: {
                    url: node => {
                        return node === '#' ? location.pathname : (location.pathname + '?' + node.id)
                    },
                    data: node => ({ id : node.id })
                }
            },
            contextmenu: {
                items: node => {
                    const contextOptions = {
                        rename: {
                            label: 'Rename',
                            action: ({ reference }) => {
                                reference.jstree().edit(node);
                            }
                        },
                        addChild: {
                            label: 'Add new child',
                            action: async ({ reference }) => {
                                const data = {parent: node.id, text: `${node.text} child no ${node.children.length + 1}`};
                                const resp = await createNode(location.pathname, data);
                                reference.jstree().create_node(node, resp);
                            }
                        }
                    };

                    if (node.children.length === 0) {
                        contextOptions.remove = {
                            label: 'Delete',
                            action: async ({ reference }) => {
                                if (confirm('Sure?')) {
                                    const result = await deleteNode(`${location.pathname}/${node.id}`);
                                    reference.jstree(node).delete_node(node);
                                }
                            }
                        };
                    }

                    return contextOptions;
                }
            },
            plugins : [ 'contextmenu', 'changed', 'dnd', 'sort' ]
        }).on('rename_node.jstree', async (e, { instance, node, old, text }) => {
            if (!confirm('Sure?')) {
                // data.node.text = data.old;
                return instance.rename_node(node, old);
            }

            const result = await updateNode(`${location.pathname}/${node.id}`, { text });
        }).on("changed.jstree", (e, data) => {
            // debugger
        });
        $(document).on("dnd_stop.vakata", (e, { data }) => {
            const { nodes, origin } = data;

            nodes.forEach(async key => {
                let { id, parent } = origin._model.data[key];
                if (parent === '#') {
                    parent = null;
                }

                const result = await updateNode(`${location.pathname}/${id}`,{ parent });
            });
        });
    }

    return {

        //main function to initiate the module
        init: function() {

            demo1();
        }

    };

}();
