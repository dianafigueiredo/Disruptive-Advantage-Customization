import * as React from 'react';
import * as ReactDOM from "react-dom";
import * as FluentUI from 'office-ui-fabric-react/lib/Dropdown';
import * as Requests from './Requests';



export class DropDown extends React.Component {



    private dropdownControlledExampleOptions = [
        { key: 'fruitsHeader', text: 'Fruits', itemType: FluentUI.DropdownMenuItemType.Header },
        { key: '', text: '' },
        { key: 'banana', text: 'Banana' },
        { key: 'orange', text: 'Orange', disabled: true },
        { key: 'grape', text: 'Grape' },
        { key: 'divider_1', text: '-', itemType: FluentUI.DropdownMenuItemType.Divider },
        { key: 'vegetablesHeader', text: 'Vegetables', itemType: FluentUI.DropdownMenuItemType.Header },
        { key: 'broccoli', text: 'Broccoli' },
        { key: 'carrot', text: 'Carrot' },
        { key: 'lettuce', text: 'Lettuce' },

    ];

    private getEntityAttributesMetadata = () => {

        let attributesRequest = Requests.getRequest("/api/data/v9.1/dia_vessels?$select=dia_name,dia_occupation,dia_remainingcapacity,dia_vesselid", false);

        attributesRequest.value.forEach((element: { dia_name: string, dia_vesselid : string}) => {

            if (element.dia_name == null) { return };
            this.dropdownControlledExampleOptions.push({ key: element.dia_name+ " - " + element.dia_vesselid + " - " + "dia_vessel",  text: element.dia_name });

            //this.entityAttributes.push({ logicalName: element.LogicalName, name: element.DisplayName.UserLocalizedLabel.Label, type: element.AttributeType });
        });
    }

    render() {
         this.getEntityAttributesMetadata();

        return (
            <FluentUI.Dropdown
                options={this.dropdownControlledExampleOptions}
                onChange={this.drgfth}
            /> 
            )
    }

    private drgfth = (event: React.FormEvent<HTMLDivElement>, option?: FluentUI.IDropdownOption, index?: number) => {

        Xrm.Page.getAttribute("dia_vesseldropdown").setValue(option?.key);
        
    }


}



 