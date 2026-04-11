function setRequestPayload(context, events, done) {
  const nonce = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  context.vars.requestMessage = `Performance request ${nonce} with consistent weekly availability.`;
  context.vars.requestExperience = `Performance experience ${nonce} with prior community initiative support.`;
  return done();
}

function setRandomStatus(context, events, done) {
  const statuses = ['approved', 'rejected'];
  context.vars.nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
  return done();
}

module.exports = {
  setRequestPayload,
  setRandomStatus,
};
