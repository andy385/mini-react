import React from '../core/React'
import { describe, it, expect } from 'vitest'

describe('createElement', () => {
    it('should return vdom for element', () => {
        const el = React.createElement('div', {id: 'app'}, 'app');
        expect(el).toEqual({
            type: 'div',
            props: {
                id: 'app',
                children: [
                    {
                        type: 'TEXT_ELEMENT',
                        props: {
                            nodeValue: 'app',
                            children: []
                        }
                    }
                ]
            }
        })
    });
});