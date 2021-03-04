const { generateCode } = require('../../../models/User.model')

describe('User model', ()=>{
    describe('generateCode', ()=>{
        it('should a return random string and length 4chars',()=>{
            const code = generateCode(4)
            expect(code.length).toBe(4)
            expect(typeof(code)).toBe('string')
        })
    })
    
})