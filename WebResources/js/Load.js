function onload(executionContext) {
    var formContext = executionContext.getFormContext();
    CalculateNET(executionContext);
    formContext.getAttribute("dia_totalgross").addOnChange(CalculateNET);
    formContext.getAttribute("dia_totaltare").addOnChange(CalculateNET);
    formContext.getAttribute("dia_totalmog").addOnChange(CalculateNET);
}

function CalculateNET(executionContext) {

    var formContext = executionContext.getFormContext();

    var TotalGross = formContext.getAttribute("dia_totalgross").getValue();
    var TotalTare = formContext.getAttribute("dia_totaltare").getValue();
    var TotalMOG = formContext.getAttribute("dia_totalmog").getValue();

    var TotalNETFinal = TotalGross-(TotalTare + TotalMOG);

    formContext.getAttribute("dia_totalgross").setValue(TotalGross);
    formContext.getAttribute("dia_totaltare").setValue(TotalTare);
    formContext.getAttribute("dia_totalnet").setValue(TotalNETFinal);
    formContext.getAttribute("dia_totalmog").setValue(TotalMOG);




}