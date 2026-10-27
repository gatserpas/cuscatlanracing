// World-space driving with a small, speed-dependent heading assist.
export function roadCenter(s){return Math.sin(s/145)*34+Math.sin(s/400)*55}
export function roadSlope(s){return Math.cos(s/145)*34/145+Math.cos(s/400)*55/400}
export function createPose(){return {px:0,pz:0,yaw:-Math.atan(roadSlope(0)),steer:0}}
// At most one degree per second, only close to the road and with no steering input.
export function gentleAssist(pose,speed,input,dt){if(speed<4||Math.abs(input)>.001||Math.abs(pose.steer)>.12||pose.wallContact||Math.abs(roadOffset(pose))>5.5)return 0;const s=-pose.pz;if(s<0||s>3000)return 0;const target=-Math.atan(roadSlope(s+8));const error=Math.atan2(Math.sin(target-pose.yaw),Math.cos(target-pose.yaw));if(Math.abs(error)>.4)return 0;return Math.max(-.018,Math.min(.018,error*.045))*Math.min(1,speed/18)*dt}
export function drive(pose,speed,input,dt){pose.steer+=(input-pose.steer)*(1-Math.exp(-dt*10));const lock=.43/(1+speed*.022);pose.yaw-=speed/5.6*Math.tan(pose.steer*lock)*dt;pose.yaw+=gentleAssist(pose,speed,input,dt);pose.px-=Math.sin(pose.yaw)*speed*dt;pose.pz-=Math.cos(pose.yaw)*speed*dt;pose.px+=(pose.reboundX||0)*dt;pose.pz+=(pose.reboundZ||0)*dt;pose.reboundX=(pose.reboundX||0)*Math.exp(-dt*9);pose.reboundZ=(pose.reboundZ||0)*Math.exp(-dt*9);return pose}
export function roadOffset(pose){const s=-pose.pz;return (pose.px-roadCenter(s))/Math.sqrt(1+roadSlope(s)**2)}
export function recover(pose){const s=Math.max(0,Math.min(2980,-pose.pz));pose.px=roadCenter(s);pose.pz=-s;pose.yaw=-Math.atan(roadSlope(s));pose.steer=0;pose.reboundX=0;pose.reboundZ=0;pose.wallCooldown=0;pose.wallContact=0}
// Physical rail contact; steering and heading remain entirely user-controlled.
export function resolveBarriers(pose,speed,dt){
const s=-pose.pz;if(s<0||s>3295)return {speed,impact:false,side:0};
const slope=roadSlope(s),length=Math.hypot(1,slope),nx=1/length,nz=slope/length;
const offset=roadOffset(pose),side=Math.sign(offset),angle=pose.yaw+Math.atan(slope);
const halfWidth=Math.abs(Math.cos(angle))*1.25+Math.abs(Math.sin(angle))*2.8;
const limit=7.48-halfWidth,penetration=Math.abs(offset)-limit;
pose.wallCooldown=Math.max(0,(pose.wallCooldown||0)-dt);
if(penetration<=0){pose.wallContact=0;return {speed,impact:false,side:0}}
pose.px-=side*nx*(penetration+.015);pose.pz-=side*nz*(penetration+.015);
const incidence=Math.abs(-Math.sin(pose.yaw)*nx-Math.cos(pose.yaw)*nz);
const impact=pose.wallContact!==side&&pose.wallCooldown===0&&speed>2;
if(impact){speed*=1-(.1+.12*incidence);pose.reboundX=-side*nx*(.8+incidence*2);pose.reboundZ=-side*nz*(.8+incidence*2);pose.wallCooldown=.45}
pose.wallContact=side;
return {speed:Math.max(0,speed-2*dt),impact,side};
}
