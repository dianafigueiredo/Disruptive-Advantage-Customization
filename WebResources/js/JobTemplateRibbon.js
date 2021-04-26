function OpenFormtemplate(formContext) {

    var RecordId = formContext.data.entity.getEntityReference();
    //var jobName = formContext.getAttribute("dia_name").getValue();
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "dia_jobadditive";
    entityFormOptions["formId"] = "4FB98C8A-FC0C-4971-801D-75FDBD83B873";
   

    // Set default values for the Contact form
    var formParameters = {};

    //formParameters["dia_jobname"] = jobName;

    formParameters["dia_intake"] = RecordId;


    // Open the form.
    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success) {
            console.log(success);
        },
        function (error) {
            console.log(error);
        });
    /*var batch = formContext.getAttribute("dia_batch").getValue();
    var quantity = formContext.getAttribute("dia_quantity").getValue();
    var jobId = formContext.data.entity.getId();
    var jobName = formContext.getAttribute("dia_name").getValue();
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "dia_jobdestinationvessel";

    // Set default values for the Contact form
    var formParameters = {};
    formParameters["dia_batch"] = batch;
    formParameters["dia_quantity"] = quantity;
    formParameters["dia_job"] = jobId;
    formParameters["dia_jobname"] = jobName;

    // Open the form.
    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success) {
            console.log(success);
        },
        function (error) {
            console.log(error);
        });*/
}

function OpenFormAdditive(formContext) {

    var RecordId = formContext.data.entity.getEntityReference();
    var jobName = formContext.getAttribute("dia_name").getValue();
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "dia_jobadditive";
    entityFormOptions["formId"] = "F28F4E55-A7C7-4F0E-BEAB-B21D7EFD842C";


    // Set default values for the Contact form
    var formParameters = {};

    formParameters["dia_jobid"] = RecordId;

    formParameters["dia_job"] = RecordId;


    // Open the form.
    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success) {
            console.log(success);
        },
        function (error) {
            console.log(error);
        });


}