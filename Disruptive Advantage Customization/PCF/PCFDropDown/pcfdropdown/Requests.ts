export function getRequest(url: string, async: boolean, top?: number) {

    var results: any;

    var request = new XMLHttpRequest();
    request.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + url, async);
    request.setRequestHeader("OData-MaxVersion", "4.0");
    request.setRequestHeader("OData-Version", "4.0");
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json; charset=utf-8");

    var prefer: string = "odata.include-annotations=\"*\"";

    top ? prefer = prefer.concat(",odata.maxpagesize=", top.toString()) : null;

    request.setRequestHeader("Prefer", prefer);

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            request.onreadystatechange = null;
            if (this.status === 200) {
                results = JSON.parse(this.response);
            } else {
                alert("error");
            }
        }
    };
    request.send();

    return results;
}