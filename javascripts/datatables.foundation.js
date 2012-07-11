/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
    return {
        "iStart":         oSettings._iDisplayStart,
        "iEnd":           oSettings.fnDisplayEnd(),
        "iLength":        oSettings._iDisplayLength,
        "iTotal":         oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
        "iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
    };
};
 
/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
    "foundation": {
        "fnInit": function( oSettings, nPaging, fnDraw ) {
            var oLang = oSettings.oLanguage.oPaginate;
            var fnClickHandler = function ( e ) {
                e.preventDefault();
                if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                    fnDraw( oSettings );
                }
            };
 
            $(nPaging).addClass('pagination').append(
                '<ul class="pagination">'+
                    '<li class="arrow unavailable"><a href="#">&laquo; '+oLang.sPrevious+'</a></li>'+
                    '<li class="arrow unavailable"><a href="#">'+oLang.sNext+' &raquo; </a></li>'+
                '</ul>'
            );
            var els = $('a', nPaging);
            $(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
            $(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
        },
 
        "fnUpdate": function ( oSettings, fnDraw ) {
            var iListLength = 5;
            var oPaging = oSettings.oInstance.fnPagingInfo();
            var an = oSettings.aanFeatures.p;
            var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);
 
            if ( oPaging.iTotalPages < iListLength) {
                iStart = 1;
                iEnd = oPaging.iTotalPages;
            }
            else if ( oPaging.iPage <= iHalf ) {
                iStart = 1;
                iEnd = iListLength;
            } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                iStart = oPaging.iTotalPages - iListLength + 1;
                iEnd = oPaging.iTotalPages;
            } else {
                iStart = oPaging.iPage - iHalf + 1;
                iEnd = iStart + iListLength - 1;
            }
 
            for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
                // Remove the middle elements
                $('li:gt(0)', an[i]).filter(':not(:last)').remove();
 
                // Add the new list items and their event handlers
                for ( j=iStart ; j<=iEnd ; j++ ) {
                    sClass = (j==oPaging.iPage+1) ? 'class="current"' : '';
                    $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                        .insertBefore( $('li:last', an[i])[0] )
                        .bind('click', function (e) {
                            e.preventDefault();
                            oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                            fnDraw( oSettings );
                        });
                }
 
                // Add / remove disabled classes from the static elements
                if ( oPaging.iPage === 0 ) {
                    $('li:first', an[i]).addClass('unavailable');
                } else {
                    $('li:first', an[i]).removeClass('unavailable');
                }
 
                if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                    $('li:last', an[i]).addClass('unavailable');
                } else {
                    $('li:last', an[i]).removeClass('unavailable');
                }
            }
        }
    }
} 
);

$.extend( $.fn.dataTableExt._fnFeatureHtmlLength = function( oSettings ) {
    if ( oSettings.oScroll.bInfinite )
    {
        return null;
    }
    
    /* This can be overruled by not using the _MENU_ var/macro in the language variable */
    var sName = 'name="'+oSettings.sTableId+'_length"';
    var sStdMenu = '<select style="display:none;" id="customDropdown" '+sName+'>';
    var i, iLen;
    var aLengthMenu = oSettings.aLengthMenu;
    
    if ( aLengthMenu.length == 2 && typeof aLengthMenu[0] === 'object' && 
            typeof aLengthMenu[1] === 'object' )
    {
        for ( i=0, iLen=aLengthMenu[0].length ; i<iLen ; i++ )
        {
            sStdMenu += '<option value="'+aLengthMenu[0][i]+'">'+aLengthMenu[1][i]+'</option>';
        }
    }
    else
    {
        for ( i=0, iLen=aLengthMenu.length ; i<iLen ; i++ )
        {
            sStdMenu += '<option value="'+aLengthMenu[i]+'">'+aLengthMenu[i]+'</option>';
        }
    }

    sStdMenu += '</select>';
    sStdMenu += '<div class="custom dropdown">';
    sStdMenu += '<a href="#" class="current">'+oSettings._iDisplayLength+'</a>';
    sStdMenu += '<a href="#" class="selector"></a>';
    sStdMenu += '<ul>';

    if ( aLengthMenu.length == 2 && typeof aLengthMenu[0] === 'object' && 
            typeof aLengthMenu[1] === 'object' )
    {
        for ( i=0, iLen=aLengthMenu[0].length ; i<iLen ; i++ )
        {
            sStdMenu += '<li>'+aLengthMenu[1][i]+'</li>';
        }
    }
    else
    {
        for ( i=0, iLen=aLengthMenu.length ; i<iLen ; i++ )
        {
            sStdMenu += '<li>'+aLengthMenu[i]+'</li>';
        }
    }
    
    sStdMenu += '</ul>';
    sStdMenu += '</div>';

    var nLength = document.createElement( 'div' );
    if ( !oSettings.aanFeatures.l )
    {
        nLength.id = oSettings.sTableId+'_length';
    }
    nLength.className = oSettings.oClasses.sLength;
    nLength.innerHTML = '<label>'+oSettings.oLanguage.sLengthMenu.replace( '_MENU_', sStdMenu )+'</label>';
    nLength.innerHTML = '<form class="custom">'+oSettings.oLanguage.sLengthMenu.replace( '_MENU_', sStdMenu )+'</form>';
    
    /*
     * Set the length to the current display length - thanks to Andrea Pavlovic for this fix,
     * and Stefan Skopnik for fixing the fix!
     */
    $('select option[value="'+oSettings._iDisplayLength+'"]', nLength).attr("selected", true);

    $('div.custom ul', nLength).on('click', 'li', function(event) {
        var iVal = $(this).text();
        
        /* Update all other length options for the new display */
        var n = oSettings.aanFeatures.l;
        for ( i=0, iLen=n.length ; i<iLen ; i++ )
        {
            if ( n[i] != this.parentNode )
            {
                $('select', n[i]).val( iVal );
            }
        }
        
        /* Redraw the table */
        oSettings._iDisplayLength = parseInt(iVal, 10);
        _fnCalculateEnd( oSettings );
        
        /* If we have space to show extra rows (backing up from the end point - then do so */
        if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() )
        {
            oSettings._iDisplayStart = oSettings.fnDisplayEnd() - oSettings._iDisplayLength;
            if ( oSettings._iDisplayStart < 0 )
            {
                oSettings._iDisplayStart = 0;
            }
        }
        
        if ( oSettings._iDisplayLength == -1 )
        {
            oSettings._iDisplayStart = 0;
        }
        
        _fnDraw( oSettings );
    } );

    $('select', nLength).attr('aria-controls', oSettings.sTableId);
    
    return nLength;
}
);