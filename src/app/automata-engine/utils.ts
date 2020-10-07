export class Utils {
    
    public static getMiddleDivisor(a: number, b: number): number {
        let divisors = this.commonsDivisors(a, b);
        return divisors[Math.floor(divisors.length/2)]
    }

    public static getBiggestCommonDivisor(a: number, b: number): number {
        let divisors = this.commonsDivisors(a, b);
        return divisors[divisors.length-1]
    }
    
    
    private static commonsDivisors(a: number, b: number): Array<number> {
        let divisorsA = this.getDivisors(a);
        let divisorsB = this.getDivisors(b);
        return this.getCommonElements(divisorsA, divisorsB);
    }
    
    private static getDivisors(n: number): Array<number> {
        let divisors = new Array<number>();
        for (let i=1;i<=n;i++) {
            if (n%i==0) {
                divisors.push(i)
            }
        }
        return divisors;
    }

    public static getCommonElements(arr1: Array<number>, arr2: Array<number>): Array<number> {
        var common = [];                
        for(let i=0 ; i<arr1.length ; ++i) {
            for(let j=0 ; j<arr2.length ; ++j) {
                if(arr1[i] == arr2[j]) {      
                    common.push(arr1[i]);       
                }
            }
        }
        return common;
    }

}