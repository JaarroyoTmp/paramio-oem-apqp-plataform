(function(){
  function toleranceLimit(c,it){
    const candidates=[it?.plus,c?.upper,c?.tolerance?.upper,c?.tolerance];
    for(const v of candidates){const n=Math.abs(num(v));if(Number.isFinite(n))return n;}
    return NaN;
  }
  function dimensionalBounds(c,it){
    const nominal=Number.isFinite(num(it?.nominal))?num(it.nominal):num(c?.nominal);
    const plus=Number.isFinite(num(it?.plus))?num(it.plus):num(c?.upper);
    const minusRaw=Number.isFinite(num(it?.minus))?num(it.minus):num(c?.lower);
    if(!Number.isFinite(nominal))return null;
    const upper=Number.isFinite(plus)?nominal+Math.abs(plus):nominal;
    const lower=Number.isFinite(minusRaw)?nominal-Math.abs(minusRaw):nominal;
    return {lower,upper,nominal};
  }
  window.validateMeasurement=function(c,it){
    const v=num(it?.measured??it?.value??it?.reportValue);
    if(!Number.isFinite(v))return {status:'PEND.',ok:false,reason:'Sin medida numerica'};
    const ft=featureType(c);
    if(isGeometricType(ft)){
      const limit=toleranceLimit(c,it);
      if(!Number.isFinite(limit))return {status:'OK',ok:true,reason:'Geometrica sin tolerancia numerica: no se fuerza NOK'};
      return v>=-1e-9&&v<=limit+1e-9?{status:'OK',ok:true,reason:'0 <= valor <= tolerancia'}:{status:'NOK',ok:false,reason:'Geometrica fuera de tolerancia'};
    }
    const b=dimensionalBounds(c,it);
    if(!b)return {status:'OK',ok:true,reason:'Dimensional sin nominal numerico'};
    return v>=b.lower-1e-9&&v<=b.upper+1e-9?{status:'OK',ok:true,reason:'Dentro de nominal +/- tolerancia'}:{status:'NOK',ok:false,reason:'Fuera de nominal +/- tolerancia'};
  };
})();
