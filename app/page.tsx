'use client'
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code"
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import {Input} from "@nextui-org/input";
import {Tooltip} from "@nextui-org/tooltip";
import {useState, useMemo} from "react";
import {motion} from 'framer-motion'
import { number } from "prop-types";


const show = {
	opacity: 1,
	display: "block"
  };
  
  const hide = {
	opacity: 0,
	transitionEnd: {
	  display: "none"
	}
};

export default function Home() {
	const [memory_total_m, MemoryTotalM] = useState<Number>(158840);
	const [memory_total_s, MemoryTotalS] = useState<Number>(158840);
	const [overcommit_ratio, OvercommitRatio] = useState<Number>(93);
	const [swap, Swap] = useState<Number>(4095);
	const [gp_resource_group_memory_limit, GpResourceGroupMemoryLimit] = useState<Number>(0.7);
	const [segment_count, SegmentCount] = useState<Number>(4);
	/*const [resource_group_memory_master, ResourceGroupMemoryMaster] = useState<Number>(0);
	const [resource_group_memory_per_segment, ResourceGroupMemoryPerSegment] = useState<Number>(0);*/
	const [memory_limit, MemoryLimit] = useState<Number>(8);
	const [memory_shared_quota, MemorySharedQuota] = useState<Number>(20);
	const [cuncurrency, Cuncurrency] = useState<Number>(50);

	//Функция вычисляет общую доступную память для мастера
	function doCalcTotalMemoryM(): Number {
		let result: Number = (Number(memory_total_m) * Number(overcommit_ratio) / 100) + Number(swap) ;
		return result;
	}
	//Функция вычисляет общую доступную память для сегмента
	function doCalcTotalMemoryS(): Number {
		let result: Number = (Number(memory_total_s) * Number(overcommit_ratio) / 100) + Number(swap) ;
		return result;
	}

	const total_memory_m  = useMemo<Number>(doCalcTotalMemoryM, [memory_total_m, overcommit_ratio, swap]);

	const total_memory_s  = useMemo<Number>(doCalcTotalMemoryS, [memory_total_s, overcommit_ratio, swap]);

	function doCalcTotalMasterMemory(): Number {
		 let result: Number = Number(total_memory_m) * Number(gp_resource_group_memory_limit);
		 return result;
	}

	function doCalcTotalSegmentMemory(): Number {
		if (segment_count != 0) { 
			return (Number(total_memory_m) * Number(gp_resource_group_memory_limit)) / Number(segment_count);
		}
		else
			return 0;
   }

	const total_master_memory = useMemo<Number>(doCalcTotalMasterMemory, [total_memory_m, gp_resource_group_memory_limit]);
	const total_segment_memory = useMemo<Number>(doCalcTotalSegmentMemory, [total_memory_s, gp_resource_group_memory_limit, segment_count]);

	const resource_group_memory_master = useMemo(doCalcResourceGroupMemoryMaster, [memory_limit]);
	const resource_group_memory_per_segment = useMemo(doCalcResourceGroupMemoryPerSegment, [memory_limit]);
	const fixed_memory_per_segment = useMemo(doCalcFixedMemoryPerSegment, [memory_shared_quota])
	const fixed_memory_per_query = useMemo(doCalcFixedMemoryPerQuery, [cuncurrency, fixed_memory_per_segment]);
	const shared_memory_per_segment = useMemo(doCalcSharedMemoryPerSegment, [resource_group_memory_per_segment, memory_shared_quota]);
	const memory_splill_ratio = useMemo(doCalcMemorySpillRatio, [fixed_memory_per_query, cuncurrency, resource_group_memory_master]);

	function doCalcResourceGroupMemoryMaster(): Number {
		return Number(total_master_memory) * Number(memory_limit) / 100;
	}

	function doCalcSharedMemoryPerSegment(): Number {
		return (Number(resource_group_memory_per_segment) * Number(memory_shared_quota)) / 100
	}

	function doCalcResourceGroupMemoryPerSegment(): Number {
		return Number(total_segment_memory) * Number(memory_limit) / 100;
	}

	function doCalcFixedMemoryPerSegment(): Number {
		return Number(resource_group_memory_per_segment) * ((100 - Number(memory_shared_quota)) / 100)
	}

	function doCalcFixedMemoryPerQuery(): Number {
		return Number(fixed_memory_per_segment) / Number(cuncurrency);
	}
    
	function doCalcMemorySpillRatio(): Number {
		return (((Number(fixed_memory_per_query) - 30) * Number(cuncurrency)) / Number(resource_group_memory_master)) * 100;
	}
	 
	function ChangeMamoryTotalM(value: string){
		MemoryTotalM(Number(value));
	}

	function ChangeMamoryTotalS(value: string){
		MemoryTotalS(Number(value));
	}

	function ChangeOvercommitMemory(value: string){
		OvercommitRatio(Number(value));
	}

	function ChangeSwap(value: string){
		Swap(Number(value));
	}

	function ChangeGpResourceGroupMemoryLimit(value: string){
		GpResourceGroupMemoryLimit(Number(value));
	}

	function ChangeSegmentCount(value: string) {
		SegmentCount(Number(value));
	}

	function ChangeMemoryLimit(value: string) {
		MemoryLimit(Number(value));
	}

	function ChangeMemorySharedQuota(value: string){
		MemorySharedQuota(Number(value));
	}

	git function ChangeCuncurrency(value: string) {
		Cuncurrency(Number(value));
	}

	return (
		<section>
			<section className="flex flex-row gap-5 mb-5">
				<div className="basis-1/2">
					<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
						<Input type="Number" label="Total memory on master" onValueChange={ChangeMamoryTotalM} defaultValue={memory_total_m?.toString()} isRequired/>
					</div>
				</div>

				<div className="basis-1/2">
					<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
						<Input type="Number" label="Total memory on segments" isRequired onValueChange={ChangeMamoryTotalS} defaultValue={memory_total_s?.toString()}/>
					</div>
				</div>
			</section>

			<section className="flex flex-col gap-5 mb-5">
				<div className="">
					<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
						<Input type="Number" label="Overcommit ratio"  isRequired onValueChange={ChangeOvercommitMemory} defaultValue={overcommit_ratio?.toString()}/>
					</div>
				</div>
				<div className="">
					<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
						<Input type="Number" label="SWAP" isRequired onValueChange={ChangeSwap} defaultValue={swap?.toString()}/>
					</div>
				</div>
			</section>
			<motion.section 
				animate={ memory_total_m != 0 && memory_total_s != 0 && overcommit_ratio != 0 ? show : hide}
				>
				<section
				className="flex flex-row gap-5 mb-5"
				>
					<div className="basis-1/2">
							Total memory on master:
						<Snippet title="Total memory on master:" symbol="" className="ml-5">
							{total_memory_m?.toString()}
						</Snippet>
					</div>
					<div className="basis-1/2">
						Total memory on segments:
						<Snippet title="Total memory on master:" symbol="" className="ml-5">
							{total_memory_s?.toString()}
						</Snippet>
					</div>
				</section>
			</motion.section>

			<motion.section 
				animate={memory_total_m != 0 && memory_total_s != 0 && overcommit_ratio != 0 ? show : hide} 
				>
				<section className="flex flex-row gap-5 mb-5">
					<div className="basis-1/2">
						<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
							<Input type="Number" label="GP resource group memory limit"  isRequired onValueChange={ChangeGpResourceGroupMemoryLimit} defaultValue={gp_resource_group_memory_limit?.toString()}/>
						</div>
					</div>
					<div className="basis-1/2">
						<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
							<Input type="Number" label="Segment count"  isRequired onValueChange={ChangeSegmentCount} defaultValue={segment_count?.toString()}/>
						</div>
					</div>
				</section>

				<div className="flex flex-row gap-5 mb-5">
					<div className="basis-1/2">
							Total memory master:
						<Snippet title="Total memory master:" symbol="" className="ml-5">
							{total_master_memory?.toString()}
						</Snippet>
					</div>
					<div className="basis-1/2">
						Total memory segments:
						<Snippet title="Total memory master:" symbol="" className="ml-5">
							{total_segment_memory?.toString()}
						</Snippet>
					</div>
				</div>	

				<section className="flex flex-col gap-5 mb-5">
					<div className="">
						<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
							<Input type="Number" label="Memory limit" isRequired onValueChange={ChangeMemoryLimit} max={100} defaultValue={memory_limit?.toString()}/>
						</div>
					</div>
				</section>
				<section className="flex flex-col gap-5 mb-5">
					<div className="">
						<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
							<Input type="Number" label="Memory shared quota" isRequired onValueChange={ChangeMemorySharedQuota} max={100} defaultValue={memory_shared_quota?.toString()}/>
						</div>
					</div>
				</section>
				<section className="flex flex-col gap-5 mb-5">
					<div className="">
						<div className="flex w-full flex-wrap md:flex-nowrap gap-4">
							<Input type="Number" label="Cuncurrency" isRequired onValueChange={ChangeCuncurrency} max={100} defaultValue={cuncurrency?.toString()}/>
						</div>
					</div>
				</section>

				<motion.section
					animate={memory_limit != 0 ? show : hide}
				>
					<section
						className="flex flex-row gap-5 mb-5"
					>
						<div className="basis-1/2">
							Resource group memory master:
							<Snippet symbol="" className="ml-5">
								{resource_group_memory_master?.toString()}
							</Snippet>
						</div>
						<div className="basis-1/2">
							Resource group memory per segment:
							<Snippet symbol="" className="ml-5">
								{resource_group_memory_per_segment?.toString()}
							</Snippet>
						</div>
					</section>
					<section className="">
						<div className="basis-1/2">
							Fixed memory per segment:
							<Snippet symbol="" className="ml-5">
								{fixed_memory_per_segment?.toString()}
							</Snippet>
						</div>
						<div className="basis-1/2">
							Fixed memory per query:
							<Snippet symbol="" className="ml-5">
								{fixed_memory_per_query?.toString()}
							</Snippet>
						</div>
						<div className="basis-1/2">
							Shared memory per segment:
							<Snippet symbol="" className="ml-5">
								{shared_memory_per_segment?.toString()}
							</Snippet>
						</div>
						<div className="basis-1/2">
							Memory spill ratio:
							<Snippet symbol="" className="ml-5"  color="success">
								{memory_splill_ratio?.toString()}
							</Snippet>
						</div>
					</section>
				</motion.section>
			</motion.section>

		</section>
	);
}
