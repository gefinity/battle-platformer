import $                from 'jquery';
import imagesLoaded     from 'imagesloaded';

export default {

    loadImage: function (url) {

        let promise = new Promise((resolve, reject) => {

            let newImage = new Image();
            newImage.src = url;

            let imageLoad = imagesLoaded(newImage);
            imageLoad.on('done', () => {
                resolve(newImage);
            });
            imageLoad.on('fail', () => {
                reject('broken image');
            });


        });

        return promise;

    },

    loadText: function (url) {

        let promise = new Promise((resolve, reject) => {

            $.ajax({
                url: url,
                dataType: 'text',
                success: (data) => {
                    resolve(data);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    throw Error(errorThrown);
                }
            });   

        });

        return promise;

    }

};