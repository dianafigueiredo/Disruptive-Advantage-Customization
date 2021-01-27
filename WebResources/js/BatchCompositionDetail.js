function OnLoad (executionContext) {
    var formContext = executionContext.getFormContext();
    percentage (executionContext);
    formContext.getAttribute("dia_level").addOnChange(percentage);
}


function percentage (executionContext)
{
    var formContext = executionContext.getFormContext();
    var level = formContext.getAttribute('dia_level').getValue();

    if(level == 914440000){

        formContext.ui.controls.get('dia_regionpercentage').setVisible(false);
        formContext.ui.controls.get('dia_varietypercentage').setVisible(false);
        formContext.ui.controls.get('dia_vintagepercentage').setVisible(false);
        formContext.ui.controls.get('dia_total').setVisible(true);
    }
    
    
    else if(level == 914440001){
    
        formContext.ui.controls.get('dia_total').setVisible(false);
        formContext.ui.controls.get('dia_regionpercentage').setVisible(true);
        formContext.ui.controls.get('dia_varietypercentage').setVisible(true);
        formContext.ui.controls.get('dia_vintagepercentage').setVisible(true);


    }

    

}