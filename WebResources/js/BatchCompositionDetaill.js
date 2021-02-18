function OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    percentage(executionContext);
    formContext.getAttribute("dia_level").addOnChange(percentage);
}


function percentage(executionContext) {
    var formContext = executionContext.getFormContext();
    var level = formContext.getAttribute('dia_level').getValue();

    if (level == 914440000) {

        Xrm.Page.ui.tabs.get('tab_2').sections.get('Summary').setVisible(true);
        Xrm.Page.ui.tabs.get('tab_2').sections.get('Detail').setVisible(false);
    }


    else if (level == 914440001) {

        Xrm.Page.ui.tabs.get('tab_2').sections.get('Summary').setVisible(false);
        Xrm.Page.ui.tabs.get('tab_2').sections.get('Detail').setVisible(true);

    }

}