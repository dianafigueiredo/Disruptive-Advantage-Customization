import * as React from 'react';
import * as ReactDOM from "react-dom";
import * as FluentUI from 'office-ui-fabric-react/lib/Dropdown';
import * as Requests from './Requests';
export class DropDown extends React.Component {


    render() {

        return (
            <FluentUI.Dropdown
                options={dropdownControlledExampleOptions }
            /> 
            )
    }


}

const dropdownControlledExampleOptions = [
    { key: 'fruitsHeader', text: 'Fruits', itemType: FluentUI.DropdownMenuItemType.Header },
    { key: 'apple', text: 'Apple' },
    { key: 'banana', text: 'Banana' },
    { key: 'orange', text: 'Orange', disabled: true },
    { key: 'grape', text: 'Grape' },
    { key: 'divider_1', text: '-', itemType: FluentUI.DropdownMenuItemType.Divider },
    { key: 'vegetablesHeader', text: 'Vegetables', itemType: FluentUI.DropdownMenuItemType.Header },
    { key: 'broccoli', text: 'Broccoli' },
    { key: 'carrot', text: 'Carrot' },
    { key: 'lettuce', text: 'Lettuce' },

    
];

//private getEntityAttributesMetadata = () => {

    let attributesRequest = Requests.getRequest("/api/data/v9.1/dia_vessels?$select=dia_name,dia_occupation,dia_remainingcapacity", false);

    attributesRequest.Attributes.forEach((element: { LogicalName: string; DisplayName: { UserLocalizedLabel: { Label: string; }; }; AttributeType: string; }) => {

        if (element.LogicalName == null || element.DisplayName.UserLocalizedLabel == null || element.AttributeType == null) { return };

       // this.entityAttributes.push({ logicalName: element.LogicalName, name: element.DisplayName.UserLocalizedLabel.Label, type: element.AttributeType });
    });
//}

 