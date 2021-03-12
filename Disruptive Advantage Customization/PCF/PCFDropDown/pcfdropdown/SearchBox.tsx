import * as React from 'react';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Stack, IStackTokens } from 'office-ui-fabric-react/lib/Stack';
import * as Requests from './Requests';

export class SearchBoxx extends React.Component {

    private stackTokens: Partial<IStackTokens> = { childrenGap: 20 };

    /* eslint-disable react/jsx-no-bind */
    render() {
        return (
            <Stack tokens={this.stackTokens}>
                <SearchBox placeholder="Search" onSearch={newValue => console.log('value is ' + newValue)} />
            </Stack>
        );
    };

}